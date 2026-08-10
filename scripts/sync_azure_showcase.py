#!/usr/bin/env python3
"""Refresh the Azure showcase diagrams from the sample repositories.

The Azure Sample Apps and Tutorials pages are driven by
``src/data/azure-showcase.json``. Each entry's ``url`` points at its upstream
directory, and this script uses that as the single source of truth to:

* copy ``images/architecture.png`` into the docs, where the upstream repo has one;
* render the first ```` ```mermaid ```` block of a README to SVG, where it has one;
* set, refresh or clear each entry's ``image`` accordingly.

It is idempotent: run it after the sample repositories change and commit whatever
it updates. Nothing is invented — an entry whose upstream has neither a diagram
nor a Mermaid block ends up with no image, and its card renders without one.

Usage
-----
    python3 scripts/sync_azure_showcase.py [--check]

``--check`` reports what would change and exits non-zero if anything is stale,
which is what a CI job would run.

Requirements
------------
* Local clones of the sample repositories (see ``REPOS``).
* ``@mermaid-js/mermaid-cli`` on the PATH (``npx mmdc``) plus a Chromium binary,
  only when a Mermaid diagram actually needs re-rendering.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

DOCS = pathlib.Path(__file__).resolve().parent.parent
CATALOGUE = DOCS / "src/data/azure-showcase.json"
# mermaid-cli output is not byte-stable — element ids and float layout metrics
# vary per run — so re-rendering is keyed on a hash of the Mermaid source
# instead of on the rendered file.
MANIFEST = DOCS / "src/data/azure-showcase-diagrams.json"
IMAGES = DOCS / "src/assets/images/azure"

# GitHub org/repo -> local clone. Adjust if your clones live elsewhere.
REPOS = {
    "localstack-samples/aks-samples": pathlib.Path.home() / "localstack/aks-samples",
    "localstack/localstack-azure-samples": pathlib.Path.home() / "localstack/localstack-azure-samples",
}

URL_RE = re.compile(r"https://github\.com/([^/]+/[^/]+)/tree/([^/]+)/(.+)$")
MERMAID_RE = re.compile(r"```mermaid\s*\n(.*?)\n```", re.S)
# Larger type keeps the labels legible once a card scales the diagram down.
# Installed as a devDependency so the workflow is reproducible from a clean
# clone; `npx -p` proved unreliable at pulling Puppeteer into its cache.
MMDC = pathlib.Path(__file__).resolve().parent.parent / "node_modules/.bin/mmdc"
MERMAID_INIT = '%%{init: {"themeVariables": {"fontSize": "20px"}} }%%\n'


def upstream_dir(url: str) -> pathlib.Path | None:
    """Resolve a catalogue URL to a directory in a local clone."""
    m = URL_RE.match(url)
    if not m:
        return None
    repo, _branch, rel = m.groups()
    root = REPOS.get(repo)
    if root is None or not root.exists():
        return None
    return root / rel


def find_readme(directory: pathlib.Path) -> pathlib.Path | None:
    """A tutorial's README sometimes lives one level down, e.g. in scripts/."""
    for candidate in (directory / "README.md", directory / "scripts" / "README.md"):
        if candidate.exists():
            return candidate
    return None


# Only the AKS repo's assets are prefixed, so the two sample sets never collide
# on a shared name such as "web-app-managed-identity".
SLUG_PREFIX = {
    "localstack-samples/aks-samples": "aks-",
    "localstack/localstack-azure-samples": "",
}


def readme_url(url: str, readme: pathlib.Path) -> str | None:
    """Blob URL of the README that `readme` points at.

    Cards link here rather than to the directory: a directory without a
    README.md — `tutorials/ccm` for instance, whose README sits in `scripts/` —
    renders as a bare file listing on GitHub.
    """
    m = URL_RE.match(url)
    if not m:
        return None
    repo, branch, _rel = m.groups()
    root = REPOS.get(repo)
    if root is None:
        return None
    rel = readme.relative_to(root).as_posix()
    return f"https://github.com/{repo}/blob/{branch}/{rel}"


def slug_for(url: str) -> str:
    m = URL_RE.match(url)
    if not m:
        return re.sub(r"[^a-z0-9]+", "-", url.lower()).strip("-")
    repo, _branch, rel = m.groups()
    rel = re.sub(r"^(samples|tutorials)/", "", rel)
    rel = re.sub(r"/scripts$", "", rel)
    # Language suffixes only exist in the non-AKS repo and add nothing to a slug.
    rel = re.sub(r"/(python|dotnet|java)$", "", rel)
    return SLUG_PREFIX.get(repo, "") + rel.replace("/", "-")


def chromium() -> str | None:
    cache = pathlib.Path.home() / ".cache/ms-playwright"
    for pattern in ("chromium-*/chrome-linux/chrome", "chrome-*/chrome-linux*/chrome"):
        found = sorted(cache.glob(pattern))
        if found:
            return str(found[-1])
    return shutil.which("chromium") or shutil.which("google-chrome")


def render_mermaid(source: str, out: pathlib.Path) -> bool:
    if not MMDC.exists():
        print("  ! mmdc missing; run: npm i -D @mermaid-js/mermaid-cli puppeteer",
              file=sys.stderr)
        return False
    exe = chromium()
    if exe is None:
        print("  ! no Chromium found; cannot render Mermaid", file=sys.stderr)
        return False
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = pathlib.Path(tmp)
        mmd = tmpdir / "diagram.mmd"
        mmd.write_text(MERMAID_INIT + source, encoding="utf-8")
        cfg = tmpdir / "puppeteer.json"
        cfg.write_text('{ "args": ["--no-sandbox", "--disable-dev-shm-usage"] }')
        out.parent.mkdir(parents=True, exist_ok=True)
        # `-p @mermaid-js/mermaid-cli` makes npx fetch the tool on demand, so the
        # docs repo does not carry it (and Puppeteer's bundled Chromium) as a
        # dependency. Run from the repo root: npx resolves packages from the cwd,
        # and a temp directory has no node_modules to resolve against.
        proc = subprocess.run(
            [str(MMDC), "-i", str(mmd), "-o", str(out),
             "-b", "transparent", "-p", str(cfg)],
            capture_output=True, text=True, timeout=600, cwd=DOCS,
            env={**os.environ, "PUPPETEER_EXECUTABLE_PATH": exe},
        )
    if proc.returncode != 0 or not out.exists():
        print(f"  ! mmdc failed: {proc.stderr.strip()[:160]}", file=sys.stderr)
        return False
    return True


def write_if_changed(path: pathlib.Path, data: bytes, check: bool) -> bool:
    """Return True when the file content differs (and write it unless checking)."""
    if path.exists() and path.read_bytes() == data:
        return False
    if not check:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="report staleness without writing; non-zero exit if stale")
    args = ap.parse_args()

    catalogue = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    changed: list[str] = []
    unresolved: list[str] = []

    for kind, subdir in (("samples", "sample-apps"), ("tutorials", "tutorials")):
        for entry in catalogue.get(kind, []):
            name = entry["name"]
            src_dir = upstream_dir(entry["url"])
            if src_dir is None or not src_dir.exists():
                unresolved.append(f"{kind}: {name}")
                continue

            slug = slug_for(entry["url"])
            png = src_dir / "images" / "architecture.png"
            readme = find_readme(src_dir)

            if readme:
                link = readme_url(entry["url"], readme)
                if link and entry.get("readme") != link:
                    entry["readme"] = link
                    changed.append(f"{kind}/{slug} (readme link)")
            elif entry.pop("readme", None) is not None:
                changed.append(f"{kind}/{slug} (readme link removed)")

            if png.exists():
                target = IMAGES / subdir / f"{slug}.png"
                if write_if_changed(target, png.read_bytes(), args.check):
                    changed.append(f"{kind}/{slug}.png")
                rel = f"{subdir}/{slug}.png"
            elif readme and (m := MERMAID_RE.search(readme.read_text(encoding="utf-8"))):
                target = IMAGES / subdir / f"{slug}.svg"
                digest = hashlib.sha256(m.group(1).encode("utf-8")).hexdigest()
                if manifest.get(slug) != digest or not target.exists():
                    changed.append(f"{kind}/{slug}.svg")
                    if not args.check:
                        if not render_mermaid(m.group(1), target):
                            unresolved.append(f"{kind}: {name} (render failed)")
                            continue
                        manifest[slug] = digest
                rel = f"{subdir}/{slug}.svg"
            else:
                # No upstream artwork: the card renders without an image.
                if entry.pop("image", None) is not None:
                    changed.append(f"{kind}/{slug} (image removed)")
                continue

            if entry.get("image") != rel:
                entry["image"] = rel
                changed.append(f"{kind}/{slug} (catalogue entry)")

    # Drop images no longer referenced by any entry.
    referenced = {
        e["image"] for k in ("samples", "tutorials") for e in catalogue.get(k, []) if e.get("image")
    }
    for path in sorted(IMAGES.rglob("*")):
        if not path.is_file():
            continue
        rel = str(path.relative_to(IMAGES))
        if rel.startswith(("sample-apps/", "tutorials/")) and rel not in referenced:
            changed.append(f"orphan removed: {rel}")
            if not args.check:
                path.unlink()

    if not args.check:
        CATALOGUE.write_text(json.dumps(catalogue, indent=2) + "\n", encoding="utf-8")
        MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n",
                            encoding="utf-8")

    if unresolved:
        print("Could not resolve:")
        for u in unresolved:
            print(f"  {u}")
    if changed:
        print(("Stale" if args.check else "Updated") + f" ({len(changed)}):")
        for c in changed:
            print(f"  {c}")
    else:
        print("Everything already up to date.")

    return 1 if (args.check and changed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
