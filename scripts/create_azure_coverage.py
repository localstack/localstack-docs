"""
Generate Azure coverage JSON files from implementation CSV data.
"""

import argparse
import csv
import json
from pathlib import Path
from typing import Any


def _as_bool(value: Any, default: bool = True) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def _group_name(service_name: str, category: str) -> str:
    service_name = (service_name or "").strip()
    category = (category or "").strip()
    if not category:
        return service_name
    if category.lower() in {"none", "null", "n/a"}:
        return service_name
    if category == service_name:
        return service_name
    return f"{service_name} ({category})"


def _normalize_provider(value: str) -> str:
    return (value or "").strip().replace("_", ".")


def _resolve_input_csv(path: Path) -> Path:
    if path.exists():
        if path.is_file():
            return path
        # Support passing a directory that contains the extracted artifact.
        nested_csv = path / "implemented_features.csv"
        if nested_csv.exists():
            return nested_csv
        matches = sorted(path.rglob("implemented_features.csv"))
        if matches:
            return matches[0]
        raise FileNotFoundError(f"No implemented_features.csv found under: {path}")

    # Backward-compatible fallback for target/implemented_features.csv.
    if path.name == "implemented_features.csv" and path.parent.exists():
        matches = sorted(path.parent.rglob("implemented_features.csv"))
        if matches:
            return matches[0]

    raise FileNotFoundError(f"Input CSV not found: {path}")


def _load_csv(path: Path) -> dict[str, dict[str, dict[str, dict[str, Any]]]]:
    path = _resolve_input_csv(path)

    coverage: dict[str, dict[str, dict[str, dict[str, Any]]]] = {}
    with path.open(mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        if not reader.fieldnames:
            raise ValueError("Input CSV has no headers.")
        required_headers = {"resource_provider", "service", "feature"}
        if not required_headers.issubset(set(reader.fieldnames)):
            raise ValueError(
                "Unexpected CSV schema. Expected headers including "
                f"{sorted(required_headers)}, got {reader.fieldnames}. "
                "The downloaded artifact may contain an error payload instead of CSV data."
            )

        for row in reader:
            provider = _normalize_provider(row.get("resource_provider", ""))
            if not provider:
                continue

            feature_name = (row.get("feature") or row.get("operation") or "").strip()
            if not feature_name:
                continue

            group = _group_name(row.get("service", ""), row.get("category", ""))
            if not group:
                group = "General"

            implemented = _as_bool(
                row.get("implemented", row.get("is_implemented", row.get("isImplemented"))),
                default=True,
            )
            pro_only = _as_bool(row.get("pro", row.get("is_pro", row.get("isPro"))), default=True)

            provider_data = coverage.setdefault(provider, {})
            group_data = provider_data.setdefault(group, {})
            group_data[feature_name] = {
                "implemented": implemented,
                "pro": pro_only,
            }

    if not coverage:
        raise ValueError(
            "No Azure coverage records were parsed from the input CSV. "
            "Please verify the artifact content is valid and non-empty."
        )

    return coverage


def _sorted_details(details: dict[str, dict[str, dict[str, Any]]]) -> dict[str, dict[str, dict[str, Any]]]:
    sorted_details: dict[str, dict[str, dict[str, Any]]] = {}
    for group_name in sorted(details.keys()):
        operations = details[group_name]
        sorted_details[group_name] = dict(sorted(operations.items(), key=lambda item: item[0]))
    return sorted_details


def write_coverage_files(coverage: dict[str, dict[str, dict[str, dict[str, Any]]]], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for provider in sorted(coverage.keys()):
        payload = {
            "service": provider,
            "operations": [],
            "details": _sorted_details(coverage[provider]),
        }
        file_path = output_dir / f"{provider}.json"
        with file_path.open(mode="w", encoding="utf-8") as fd:
            json.dump(payload, fd, indent=2)
            fd.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Azure coverage JSON data.")
    parser.add_argument(
        "-i",
        "--implementation-details",
        required=True,
        help="Path to implementation details CSV.",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        required=True,
        help="Directory where generated JSON files will be written.",
    )
    args = parser.parse_args()

    coverage = _load_csv(Path(args.implementation_details))
    write_coverage_files(coverage, Path(args.output_dir))


if __name__ == "__main__":
    main()
