from __future__ import annotations

import argparse
import json
import re
from io import StringIO
from pathlib import Path
from typing import IO, Callable

from dataclasses import dataclass

COMMUNITY_HEADING_PATTERN = r"####\s*Community image"
PRO_HEADING_PATTERN = r"\n####\s*Pro image"
API_COVERAGE_HEADING_PATTERN = r"^\s*##\s|$\Z"
DEFAULT_PAGE_PATH = "src/content/docs/aws/services/cloudformation.mdx"


@dataclass
class ColumnConfig:
    header: str
    key: str
    alignment: str = "left"
    formatter: Callable[[any], str] | None = None

    def format_value(self, value: any) -> str:
        if self.formatter:
            return self.formatter(value)
        return str(value) if value is not None else "-"


def bool_formatter(value: bool):
    return "✅" if value else "-"


@dataclass
class TableConfig:
    columns: list[ColumnConfig]
    sort_by: str | None = None

    def get_headers(self) -> list[str]:
        return [col.header for col in self.columns]


class MarkdownTableGenerator:
    def __init__(self, config: TableConfig):
        self.config = config

    def _calculate_column_widths(self, data: list[dict[str, any]]) -> list[int]:
        widths = []

        for col in self.config.columns:
            max_width = len(col.header)

            for row in data:
                value = row.get(col.key, "")
                formatted_value = col.format_value(value)
                max_width = max(max_width, len(formatted_value))

            widths.append(max_width)

        return widths

    def _get_alignment_separator(self, alignment: str, width: int) -> str:
        if alignment == "right":
            return f"{'-' * (width + 1)}:"
        elif alignment == "center":
            return f":{'-' * width}:"
        else:
            return f"{'-' * width}"

    def _format_cell(self, value: str, width: int, alignment: str) -> str:
        if alignment == "right":
            return value.rjust(width)
        elif alignment == "center":
            return value.center(width)
        else:
            return value.ljust(width)

    def _write_header_row(self, writer: IO[str], widths: list[int]) -> None:
        headers = self.config.get_headers()
        formatted_headers = []

        for i, header in enumerate(headers):
            alignment = self.config.columns[i].alignment
            formatted_header = self._format_cell(header, widths[i], alignment)
            formatted_headers.append(formatted_header)

        writer.write(f"| {' | '.join(formatted_headers)} |\n")

    def _write_separator_row(self, writer: IO[str], widths: list[int]) -> None:
        separators = []
        for i, col in enumerate(self.config.columns):
            separator = self._get_alignment_separator(col.alignment, widths[i])
            separators.append(separator)

        writer.write(f"|{'|'.join(separators)}|\n")

    def _write_data_rows(
        self, writer: IO[str], data: list[Dict[str, Any]], widths: list[int]
    ) -> None:
        if self.config.sort_by:
            data = sorted(data, key=lambda x: x.get(self.config.sort_by, ""))

        for row in data:
            formatted_cells = []

            for i, col in enumerate(self.config.columns):
                value = row.get(col.key, "")
                formatted_value = col.format_value(value)
                formatted_cell = self._format_cell(
                    formatted_value, widths[i], col.alignment
                )
                formatted_cells.append(formatted_cell)

            writer.write(f"| {' | '.join(formatted_cells)} |\n")

    def generate_table(self, data: list[dict[str, any]] | None) -> str:
        if not data:
            return ""
        
        buffer = StringIO()
        widths = self._calculate_column_widths(data)

        self._write_header_row(buffer, widths)
        self._write_separator_row(buffer, widths)
        self._write_data_rows(buffer, data, widths)

        table = buffer.getvalue().rstrip("\n") + "\n"
        return table

class CloudFormationDataTransformer():
    def transform(self, section_data: dict[str, any] | None) -> list[dict[str, any]]:
        if not section_data:
            return []

        rows = []

        for resource_type, metadata in section_data.items():
            methods = set(metadata.get("methods", []))

            row = {
                "resource": resource_type,
                "create": "Create" in methods,
                "delete": "Delete" in methods,
                "update": "Update" in methods,
            }
            rows.append(row)
        return rows


def create_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Update CloudFormation Resources tables in docs"
    )
    parser.add_argument(
        "--cfn-json",
        required=True,
        type=Path,
        help="Path to iac-catalog-assets/cfn_resources.json in downloaded artifacts",
    )
    parser.add_argument(
        "--md-file",
        required=False,
        type=Path,
        default=str(DEFAULT_PAGE_PATH),
        help="Markdown file which needs to be updated",
    )

    return parser


def _load_cfn_file(cfn_file_path: Path) -> dict[str, any]:
    try:
        with cfn_file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in cfn json file: {e}")


def replace_content_between(
    content: str,
    starting_rx: str,
    ending_rx: str,
    replacement_block: str,
) -> str:
    # Build a regex that replaces the content between two headings starting_rx and ending_rx.
    # Group1 - start heading
    # Group2 - content; lookahead preserves end boundary.
    pattern = re.compile(
        rf"(^{starting_rx}\s*\n)(.*?)(?={ending_rx})",
        re.DOTALL | re.MULTILINE,
    )

    match = pattern.search(content)
    if not match:
        raise ValueError(
            f"Could not find section with heading pattern: {starting_rx!r}"
        )

    heading = match.group(1)
    replacement = f"{heading}{replacement_block}" if replacement_block else heading

    return pattern.sub(replacement, content, count=1)


def main():
    parser = create_argument_parser()
    args = parser.parse_args()

    table_config = TableConfig(
        columns=[
            ColumnConfig("Resource", "resource", "left"),
            ColumnConfig("Create", "create", "right", bool_formatter),
            ColumnConfig("Delete", "delete", "right", bool_formatter),
            ColumnConfig("Update", "update", "right", bool_formatter),
        ]
    )

    table_generator = MarkdownTableGenerator(table_config)
    data_transformer = CloudFormationDataTransformer()

    cfn_catalog = _load_cfn_file(args.cfn_json)

    community_data = data_transformer.transform(cfn_catalog.get("community"))
    pro_data = data_transformer.transform(cfn_catalog.get("pro"))

    community_table = table_generator.generate_table(community_data)
    pro_table = table_generator.generate_table(pro_data)

    original_doc = args.md_file.read_text(encoding="utf-8")
    updated_doc = original_doc

    updated_doc = replace_content_between(
        content=original_doc,
        starting_rx=COMMUNITY_HEADING_PATTERN,
        ending_rx=PRO_HEADING_PATTERN,
        replacement_block=community_table,
    )

    updated_doc = replace_content_between(
        content=updated_doc,
        starting_rx=PRO_HEADING_PATTERN,
        ending_rx=API_COVERAGE_HEADING_PATTERN,
        replacement_block=pro_table,
    )

    if updated_doc != original_doc:
        args.md_file.write_text(updated_doc)


if __name__ == "__main__":
    main()
