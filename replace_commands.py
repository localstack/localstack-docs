import os
import re
import argparse

LOG_DIR = 'changelog'
LOG_FILENAME = 'command_changes.log'
LOG_PATH = os.path.join(LOG_DIR, LOG_FILENAME)

def ensure_log_directory():
    os.makedirs(LOG_DIR, exist_ok=True)

def normalize_command_block(command_text):
    lines = command_text.strip().splitlines()
    cleaned_lines = []

    for line in lines:
        cleaned_line = re.sub(r'^\s*[$#]\s*', '', line)  # Remove leading $ or #
        cleaned_lines.append(cleaned_line)

    return "```bash\n" + "\n".join(cleaned_lines) + "\n```"

def process_file(filepath, log_entries):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    pattern = re.compile(r'\{\{<\s*command\s*>\}\}([\s\S]*?)\{\{<\s*/\s*command\s*>\}\}', re.MULTILINE)
    matches = list(pattern.finditer(content))
    if not matches:
        return

    new_content = content
    for match in matches:
        original_block = match.group(0)
        command_text = match.group(1)
        converted_block = normalize_command_block(command_text)

        # Determine line number of the start of the match
        line_number = content[:match.start()].count('\n') + 1

        new_content = new_content.replace(original_block, converted_block, 1)

        log_entry = f"{filepath}:{line_number}: {original_block.strip()} -> {converted_block.strip()}"
        log_entries.append(log_entry)

    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(new_content)

def crawl_directory(directory):
    ensure_log_directory()
    log_entries = []

    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.endswith(('.md', '.mdx')):
                filepath = os.path.join(root, filename)
                process_file(filepath, log_entries)

    # Write log file
    with open(LOG_PATH, 'w', encoding='utf-8') as log_file:
        for entry in log_entries:
            log_file.write(entry + '\n')

    print(f"Logged {len(log_entries)} change(s) to {LOG_PATH}")

def main():
    parser = argparse.ArgumentParser(description="Convert command blocks in Markdown files.")
    parser.add_argument("directory", help="Path to the root directory to scan.")
    args = parser.parse_args()

    crawl_directory(args.directory)

if __name__ == "__main__":
    main()