#!/usr/bin/env python3
"""
Script to auto-generate the LocalStack Official Extensions documentation.

This script queries the LocalStack Platform API for the list of extensions
available on the marketplace and generates a markdown documentation page with
auto-updating tables of the official and community extensions.

Usage:
    export LOCALSTACK_AUTH_TOKEN=ls-...
    python3 scripts/generate_extensions_docs.py

Requirements:
    - A valid LocalStack auth token exposed via the LOCALSTACK_AUTH_TOKEN
      environment variable.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

# Output path for the generated documentation
DEFAULT_OUTPUT_PATH = Path("src/content/docs/aws/tooling/extensions/official-extensions.md")

# LocalStack Platform API endpoint that returns the extensions marketplace.
MARKETPLACE_URL = "https://api.localstack.cloud/v1/extensions/marketplace"

REQUEST_TIMEOUT = 30


@dataclass
class Extension:
    """Represents a single marketplace extension."""

    name: str
    display_name: str
    description: str
    author: str
    version: str
    official: bool
    has_ui: bool

    @classmethod
    def from_api(cls, item: dict) -> "Extension":
        name = (item.get("name") or "").strip()
        return cls(
            name=name,
            display_name=(item.get("display_name") or name or "Unknown").strip(),
            description=(item.get("description") or "").strip() or "No description provided.",
            author=(item.get("author") or "Unknown").strip(),
            version=(item.get("version") or "").strip() or "—",
            official=bool(item.get("official")),
            has_ui=bool(item.get("has_ui")),
        )


def get_auth_token() -> str:
    """Read the LocalStack auth token from the environment."""
    token = os.environ.get("LOCALSTACK_AUTH_TOKEN", "").strip()
    if not token:
        print(
            "Error: LOCALSTACK_AUTH_TOKEN is not set. Export a valid LocalStack "
            "auth token before running this script.",
            file=sys.stderr,
        )
        sys.exit(1)
    return token


def fetch_marketplace(token: str) -> list[Extension]:
    """Fetch the marketplace extensions from the LocalStack Platform API."""
    encoded = base64.b64encode(f":{token}".encode()).decode()
    request = urllib.request.Request(
        MARKETPLACE_URL,
        headers={
            "Authorization": f"Basic {encoded}",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            payload = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            print(
                "Error: Authentication failed when contacting the marketplace API. "
                "Ensure LOCALSTACK_AUTH_TOKEN is set correctly.",
                file=sys.stderr,
            )
        else:
            print(f"Error: Marketplace request failed with HTTP {exc.code}.", file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"Error: Could not reach the marketplace API: {exc}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(payload, list):
        print("Error: Unexpected marketplace response format (expected a list).", file=sys.stderr)
        sys.exit(1)

    extensions = [
        Extension.from_api(item)
        for item in payload
        if isinstance(item, dict) and item.get("published", True)
    ]
    extensions.sort(key=lambda ext: ext.display_name.lower())
    return extensions


def _escape_cell(value: str) -> str:
    """Escape characters that would break a markdown table cell."""
    return value.replace("|", "\\|").replace("\n", " ").strip()


def generate_table(extensions: list[Extension]) -> list[str]:
    """Generate a markdown table for a list of extensions."""
    lines = [
        "| Extension | Description | Author | Install |",
        "|-----------|-------------|--------|---------|",
    ]
    for ext in extensions:
        name = _escape_cell(ext.display_name)
        if ext.has_ui:
            name = f"{name} <sup>UI</sup>"
        description = _escape_cell(ext.description)
        author = _escape_cell(ext.author)
        install = f"`localstack extensions install {ext.name}`" if ext.name else "—"
        lines.append(f"| {name} | {description} | {author} | {install} |")
    return lines


def generate_documentation(extensions: list[Extension]) -> str:
    """Generate the complete markdown documentation."""
    official = [ext for ext in extensions if ext.official]
    community = [ext for ext in extensions if not ext.official]

    doc_lines = [
        "---",
        "title: Official Extensions",
        "description: Browse the official and community LocalStack Extensions available on the marketplace.",
        "template: doc",
        "sidebar:",
        "  order: 5",
        "tags: ['Hobby']",
        "---",
        "",
        "## Introduction",
        "",
        "The tables below list the extensions currently available on the "
        "[LocalStack marketplace](https://app.localstack.cloud/extensions/library), "
        "and are kept up to date automatically.",
        "",
        "You can install any of the extensions below with the LocalStack CLI:",
        "",
        "```bash",
        "localstack extensions install <extension-name>",
        "```",
        "",
        "See [Managing extensions](/aws/tooling/extensions/managing-extensions) for more details "
        "on installing, listing, and removing extensions.",
        "",
        ":::note",
        "This page is auto-generated from the LocalStack marketplace API. "
        "Extensions marked with <sup>UI</sup> ship with a web UI.",
        ":::",
        "",
    ]

    if official:
        doc_lines.extend([
            "## Official Extensions",
            "",
            "Extensions built and maintained by the LocalStack team.",
            "",
        ])
        doc_lines.extend(generate_table(official))
        doc_lines.append("")

    if community:
        doc_lines.extend([
            "## Community Extensions",
            "",
            "Extensions contributed and maintained by the LocalStack community and partners.",
            "",
        ])
        doc_lines.extend(generate_table(community))
        doc_lines.append("")

    return "\n".join(doc_lines)


def create_argument_parser() -> argparse.ArgumentParser:
    """Create the argument parser for the script."""
    parser = argparse.ArgumentParser(
        description="Generate the LocalStack Official Extensions documentation from the marketplace API."
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help=f"Output path for the generated documentation (default: {DEFAULT_OUTPUT_PATH})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the documentation to stdout instead of writing to file",
    )
    return parser


def main() -> None:
    """Main entry point for the script."""
    parser = create_argument_parser()
    args = parser.parse_args()

    token = get_auth_token()

    print("Fetching extensions from the LocalStack marketplace...", file=sys.stderr)
    extensions = fetch_marketplace(token)
    print(f"Found {len(extensions)} published extensions.", file=sys.stderr)

    print("Generating documentation...", file=sys.stderr)
    documentation = generate_documentation(extensions)

    if args.dry_run:
        print(documentation)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(documentation.rstrip() + "\n", encoding="utf-8")
        print(f"Documentation written to: {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()
