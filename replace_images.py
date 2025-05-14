import os
import re
import argparse

LOG_DIR = 'changelog'
LOG_FILENAME = 'image_changes.log'
LOG_PATH = os.path.join(LOG_DIR, LOG_FILENAME)

def ensure_log_directory():
    os.makedirs(LOG_DIR, exist_ok=True)

def process_file(filepath, log_entries):
    with open(filepath, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    pattern = re.compile(
        r'\{\{<\s*figure\s+src="([^"]+)"\s+width="[^"]*"\s+alt="([^"]+)"\s*>\}\}'
    )

    changed = False

    for line_number, line in enumerate(lines, start=1):
        matches = list(pattern.finditer(line))
        if not matches:
            continue

        new_line = line
        for match in matches:
            src = match.group(1)
            alt = match.group(2)
            old_text = match.group(0)
            new_text = f'![{alt}](/images/aws/{src})'
            new_line = new_line.replace(old_text, new_text, 1)
            log_entry = f"{filepath}:{line_number}: {old_text} -> {new_text}"
            log_entries.append(log_entry)
            changed = True

        lines[line_number - 1] = new_line

    if changed:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.writelines(lines)

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
    parser = argparse.ArgumentParser(description="Update image syntax in Markdown files.")
    parser.add_argument("directory", help="Path to the root directory to scan.")
    args = parser.parse_args()

    crawl_directory(args.directory)

if __name__ == "__main__":
    main()
