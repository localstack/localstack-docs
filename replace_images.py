import os
import re
import argparse

LOG_DIR = 'changelog'
LOG_FILENAME = 'image_changes.log'
LOG_PATH = os.path.join(LOG_DIR, LOG_FILENAME)

def ensure_log_directory():
    os.makedirs(LOG_DIR, exist_ok=True)

def extract_attributes(tag: str):
    """Extracts src and alt attributes from a tag string."""
    src_match = re.search(r'src\s*=\s*["\']([^"\']+)["\']', tag)
    alt_match = re.search(r'alt\s*=\s*["\']([^"\']+)["\']', tag)
    if src_match and alt_match:
        return src_match.group(1), alt_match.group(1)
    return None, None

def process_file(filepath, log_entries):
    with open(filepath, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    changed = False

    for line_number, line in enumerate(lines, start=1):
        new_line = line

        # Match MDX-wrapped <img ...> tags
        mdx_pattern = re.finditer(
            r"""\{\s*/\*\s*<img\s+([^>]+?)\s*/?>\s*\*/\}\s*\{\s*/\*\s*mdx-disabled\s*\*/\s*\}""", new_line)
        for match in mdx_pattern:
            old = match.group(0)
            attrs = match.group(1)
            src, alt = extract_attributes(attrs)
            if src and alt:
                new = f'![{alt}](/images/aws/{src})'
                new_line = new_line.replace(old, new)
                log_entries.append(f"{filepath}:{line_number}: {old} -> {new}")
                changed = True

        # Match raw <img ...> tags
        img_pattern = re.finditer(
            r"""<img\s+([^>]*?)\s*/?>""", new_line)
        for match in img_pattern:
            old = match.group(0)
            attrs = match.group(1)
            src, alt = extract_attributes(attrs)
            if src and alt:
                new = f'![{alt}](/images/aws/{src})'
                new_line = new_line.replace(old, new)
                log_entries.append(f"{filepath}:{line_number}: {old} -> {new}")
                changed = True

        # Match Hugo-style figure tags
        hugo_pattern = re.finditer(
            r"""\{\{<\s*figure\s+[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>\}\}""", new_line)
        for match in hugo_pattern:
            old = match.group(0)
            src = match.group(1)
            alt = match.group(2)
            new = f'![{alt}](/images/aws/{src})'
            new_line = new_line.replace(old, new)
            log_entries.append(f"{filepath}:{line_number}: {old} -> {new}")
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
