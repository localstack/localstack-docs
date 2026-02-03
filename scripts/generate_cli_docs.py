#!/usr/bin/env python3
"""
Script to auto-generate LocalStack CLI documentation.

This script parses the LocalStack CLI help output and generates a markdown
documentation file with all commands, subcommands, and their options.

Usage:
    python3 scripts/generate_cli_docs.py

Requirements:
    - LocalStack CLI must be installed (`pip install localstack`)
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

# Output path for the generated documentation
DEFAULT_OUTPUT_PATH = Path("src/content/docs/aws/tooling/localstack-cli.md")


@dataclass
class Subcommand:
    """Represents a CLI subcommand."""
    name: str
    description: str
    help_output: str = ""


@dataclass 
class Command:
    """Represents a CLI command with its help output and subcommands."""
    name: str
    description: str
    help_output: str = ""
    subcommands: list[Subcommand] = field(default_factory=list)


def run_command(args: list[str], timeout: int = 30) -> str:
    """Execute a command and return its output."""
    try:
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        print(f"Warning: Command timed out: {' '.join(args)}", file=sys.stderr)
        return ""
    except FileNotFoundError:
        print(f"Error: Command not found: {args[0]}", file=sys.stderr)
        sys.exit(1)


def parse_subcommands_from_help(help_output: str) -> list[tuple[str, str]]:
    """Extract subcommand names and descriptions from help output."""
    subcommands = []
    
    # Look for Commands: section
    # Lines starting with exactly 2 spaces are commands, more indented lines are continuations
    commands_match = re.search(r"Commands:\n((?:[ ]{2}[^\n]*\n?)+)", help_output)
    if commands_match:
        for line in commands_match.group(1).split("\n"):
            # Only process lines that start with exactly 2 spaces (not continuation lines with more)
            if line.startswith("  ") and not line.startswith("   "):
                line = line.strip()
                if not line:
                    continue
                parts = line.split(None, 1)
                if len(parts) >= 1:
                    sub_name = parts[0]
                    sub_desc = parts[1].strip() if len(parts) > 1 else ""
                    subcommands.append((sub_name, sub_desc))
    
    # Also check for Deprecated: section (some commands have this)
    deprecated_match = re.search(r"Deprecated:\n((?:[ ]{2}[^\n]*\n?)+)", help_output)
    if deprecated_match:
        for line in deprecated_match.group(1).split("\n"):
            if line.startswith("  ") and not line.startswith("   "):
                line = line.strip()
                if not line:
                    continue
                parts = line.split(None, 1)
                if len(parts) >= 1:
                    sub_name = parts[0]
                    sub_desc = parts[1].strip() if len(parts) > 1 else ""
                    subcommands.append((sub_name, f"(Deprecated) {sub_desc}"))
    
    return subcommands


def parse_main_help() -> tuple[list[Command], list[Command]]:
    """Parse the main localstack --help output and return command lists."""
    help_output = run_command(["localstack", "--help"])
    
    regular_commands: list[Command] = []
    advanced_commands: list[Command] = []
    
    # Parse Commands section
    commands_match = re.search(r"Commands:\n((?:\s{2}[^\n]*\n)+)", help_output)
    if commands_match:
        for line in commands_match.group(1).strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            parts = line.split(None, 1)
            if len(parts) >= 1:
                cmd_name = parts[0]
                cmd_desc = parts[1].strip() if len(parts) > 1 else ""
                regular_commands.append(Command(name=cmd_name, description=cmd_desc))
    
    # Parse Advanced section
    advanced_match = re.search(r"Advanced:\n((?:\s{2}[^\n]*\n?)+)", help_output)
    if advanced_match:
        for line in advanced_match.group(1).strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            parts = line.split(None, 1)
            if len(parts) >= 1:
                cmd_name = parts[0]
                cmd_desc = parts[1].strip() if len(parts) > 1 else ""
                advanced_commands.append(Command(name=cmd_name, description=cmd_desc))
    
    return regular_commands, advanced_commands


def populate_command_details(cmd: Command) -> None:
    """Fetch help output for a command and its subcommands."""
    # Get main command help
    cmd.help_output = run_command(["localstack", cmd.name, "--help"])
    
    # Parse and fetch subcommands
    subcommand_info = parse_subcommands_from_help(cmd.help_output)
    
    for sub_name, sub_desc in subcommand_info:
        print(f"  Processing subcommand: localstack {cmd.name} {sub_name}", file=sys.stderr)
        sub_help = run_command(["localstack", cmd.name, sub_name, "--help"])
        cmd.subcommands.append(Subcommand(
            name=sub_name,
            description=sub_desc,
            help_output=sub_help.strip()
        ))


def generate_command_section(cmd: Command) -> list[str]:
    """Generate markdown for a single command with collapsible subcommands."""
    lines = []
    
    lines.append(f"### `{cmd.name}`")
    lines.append("")
    lines.append(cmd.description)
    lines.append("")
    lines.append("```bash")
    lines.append(cmd.help_output.strip())
    lines.append("```")
    lines.append("")
    
    # Add collapsible subcommands if any exist
    if cmd.subcommands:
        lines.append("<details>")
        lines.append(f"<summary>Subcommands for <code>localstack {cmd.name}</code></summary>")
        lines.append("")
        
        for sub in cmd.subcommands:
            lines.append(f"#### `{cmd.name} {sub.name}`")
            lines.append("")
            lines.append(sub.description)
            lines.append("")
            lines.append("```bash")
            lines.append(sub.help_output)
            lines.append("```")
            lines.append("")
        
        lines.append("</details>")
        lines.append("")
    
    return lines


def generate_documentation(
    regular_commands: list[Command], 
    advanced_commands: list[Command],
    version: str
) -> str:
    """Generate the complete markdown documentation."""
    doc_lines = []
    
    # Frontmatter
    doc_lines.extend([
        "---",
        "title: LocalStack CLI",
        "description: Reference guide for LocalStack CLI commands, options, and usage.",
        "template: doc",
        "sidebar:",
        "    order: 10",
        'tags: ["Free"]',
        "---",
        "",
        "## Introduction",
        "",
        "The LocalStack Command Line Interface (CLI) is a tool for starting, managing, and configuring your LocalStack container.",
        "It provides convenience features to interact with LocalStack features like Cloud Pods, Extensions, State Management, and more.",
        "",
        "To install the LocalStack CLI, follow the [installation guide](/aws/getting-started/installation/#installing-localstack-cli).",
        "",
        ":::note",
        f"This documentation was auto-generated from LocalStack CLI version `{version}`.",
        ":::",
        "",
        "## Global Options",
        "",
        "The following global options are available for the `localstack` CLI:",
        "",
        "| Option | Description |",
        "|--------|-------------|",
        "| `-v`, `--version` | Show the version and exit |",
        "| `-d`, `--debug` | Enable CLI debugging mode |",
        "| `-p`, `--profile TEXT` | Set the configuration profile |",
        "| `-h`, `--help` | Show help message and exit |",
        "",
        "## Commands",
        "",
        "The following commands are available for managing your LocalStack instance.",
        "",
    ])
    
    # Regular commands
    for cmd in regular_commands:
        doc_lines.extend(generate_command_section(cmd))
    
    # Advanced commands section
    if advanced_commands:
        doc_lines.extend([
            "## Advanced Commands",
            "",
            "The following advanced commands provide additional functionality for power users.",
            "",
        ])
        
        for cmd in advanced_commands:
            doc_lines.extend(generate_command_section(cmd))
    
    return "\n".join(doc_lines)


def create_argument_parser() -> argparse.ArgumentParser:
    """Create the argument parser for the script."""
    parser = argparse.ArgumentParser(
        description="Generate LocalStack CLI documentation from help output"
    )
    parser.add_argument(
        "--output", "-o",
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
    
    print("Parsing LocalStack CLI help...", file=sys.stderr)
    regular_commands, advanced_commands = parse_main_help()
    
    total = len(regular_commands) + len(advanced_commands)
    print(f"Found {len(regular_commands)} commands and {len(advanced_commands)} advanced commands", file=sys.stderr)
    
    # Get version
    version_output = run_command(["localstack", "--version"])
    version = version_output.strip() if version_output else "latest"
    
    # Populate details for each command (including subcommands)
    all_commands = regular_commands + advanced_commands
    for i, cmd in enumerate(all_commands):
        print(f"Processing command {i + 1}/{total}: localstack {cmd.name}", file=sys.stderr)
        populate_command_details(cmd)
    
    print("Generating documentation...", file=sys.stderr)
    documentation = generate_documentation(regular_commands, advanced_commands, version)
    
    if args.dry_run:
        print(documentation)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(documentation, encoding="utf-8")
        print(f"Documentation written to: {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()
