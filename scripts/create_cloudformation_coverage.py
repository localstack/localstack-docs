from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"
DEFAULT_DATABASE_ID = "9b3ebbcc1f6749fb908eb2e3582386b0"
DEFAULT_OUTPUT_PATH = Path("src/data/cloudformation/coverage.json")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate CloudFormation resource coverage data from Notion."
    )
    parser.add_argument(
        "--database-id",
        default=DEFAULT_DATABASE_ID,
        help="Notion database ID to query.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help="Output JSON file path.",
    )
    parser.add_argument(
        "--notion-secret",
        default=os.getenv("NOTION_SECRET"),
        help="Notion API secret. Defaults to NOTION_SECRET environment variable.",
    )
    return parser.parse_args()


def normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def resolve_property_name(properties: dict[str, Any], candidates: list[str]) -> str | None:
    normalized_map = {normalize_key(key): key for key in properties.keys()}
    for candidate in candidates:
        if key := normalized_map.get(normalize_key(candidate)):
            return key
    return None


def extract_plain_text(items: list[dict[str, Any]]) -> str:
    return "".join(item.get("plain_text", "") for item in items).strip()


def extract_property_value(prop: dict[str, Any] | None) -> Any:
    if not prop:
        return ""

    prop_type = prop.get("type")
    if prop_type == "title":
        return extract_plain_text(prop.get("title", []))
    if prop_type == "rich_text":
        return extract_plain_text(prop.get("rich_text", []))
    if prop_type == "select":
        select_value = prop.get("select")
        return (select_value or {}).get("name", "")
    if prop_type == "multi_select":
        return ", ".join(item.get("name", "") for item in prop.get("multi_select", []))
    if prop_type == "status":
        status_value = prop.get("status")
        return (status_value or {}).get("name", "")
    if prop_type == "checkbox":
        return bool(prop.get("checkbox", False))
    if prop_type == "number":
        return prop.get("number")
    if prop_type == "url":
        return prop.get("url", "")
    if prop_type == "email":
        return prop.get("email", "")
    if prop_type == "phone_number":
        return prop.get("phone_number", "")
    if prop_type == "formula":
        formula = prop.get("formula", {})
        formula_type = formula.get("type")
        if formula_type == "string":
            return formula.get("string", "") or ""
        if formula_type == "boolean":
            return bool(formula.get("boolean", False))
        if formula_type == "number":
            return formula.get("number")
        if formula_type == "date":
            date_value = formula.get("date") or {}
            return date_value.get("start", "")
        return ""
    return ""


def to_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)

    normalized = str(value).strip().lower()
    return normalized in {"true", "1", "yes", "y", "supported", "enabled"}


def derive_service(service_value: Any, resource_type: str) -> str:
    if isinstance(service_value, str) and service_value.strip():
        return service_value.strip()

    match = re.match(r"^[A-Za-z0-9]+::([^:]+)::", resource_type)
    if match:
        return match.group(1)
    return ""


def notion_post(path: str, secret: str, payload: dict[str, Any]) -> dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(4):
        request = Request(
            url=f"{NOTION_API_BASE}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {secret}",
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as err:
            body = err.read().decode("utf-8", errors="ignore")
            if err.code in {429, 500, 502, 503, 504} and attempt < 3:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"Notion API error ({err.code}): {body}") from err
        except URLError as err:
            last_error = err
            if attempt < 3:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"Notion request failed: {err.reason}") from err

    raise RuntimeError(f"Notion request failed after retries: {last_error}")


def collect_pages(database_id: str, notion_secret: str) -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    cursor: str | None = None

    while True:
        payload: dict[str, Any] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor

        response = notion_post(f"/databases/{database_id}/query", notion_secret, payload)
        pages.extend(response.get("results", []))

        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")
        if not cursor:
            break

    return pages


def transform_pages(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    for page in pages:
        properties = page.get("properties", {})

        resource_type_key = resolve_property_name(
            properties, ["Resource Type", "Resource", "Type"]
        )
        service_key = resolve_property_name(properties, ["Service"])
        supports_update_key = resolve_property_name(
            properties,
            [
                "Supports Update",
                "Should support Update",
                "Update Supported",
                "Update",
            ],
        )
        resource_type = str(
            extract_property_value(properties.get(resource_type_key)) if resource_type_key else ""
        ).strip()
        if not resource_type:
            continue

        service = derive_service(
            extract_property_value(properties.get(service_key)) if service_key else "",
            resource_type,
        )
        supports_update = to_bool(
            extract_property_value(properties.get(supports_update_key))
            if supports_update_key
            else False
        )
        rows.append(
            {
                "resource_type": resource_type,
                "service": service,
                "create": True,
                "delete": True,
                "update": supports_update,
            }
        )

    rows.sort(key=lambda item: (item["service"], item["resource_type"]))
    return rows


def write_output(output_path: Path, database_id: str, resources: list[dict[str, Any]]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "database_id": database_id,
        "total_resources": len(resources),
        "resources": resources,
    }
    output_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    args = parse_args()

    if not args.notion_secret:
        print("Please provide a Notion token via --notion-secret or NOTION_SECRET.")
        sys.exit(1)

    pages = collect_pages(database_id=args.database_id, notion_secret=args.notion_secret)
    resources = transform_pages(pages)
    write_output(args.output, args.database_id, resources)
    print(f"Wrote {len(resources)} resources to {args.output}")


if __name__ == "__main__":
    main()
