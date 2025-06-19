#!/usr/bin/env python3

import os
import glob

def add_import_to_file(filepath):
    """Add FeatureCoverage import after frontmatter if not already present"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Check if import already exists
    if any('import FeatureCoverage' in line for line in lines):
        print(f"⏭️  {os.path.basename(filepath)} - Import already exists, skipping")
        return False
    
    # Find the end of frontmatter (second occurrence of ---)
    frontmatter_end = -1
    dash_count = 0
    
    for i, line in enumerate(lines):
        if line.strip() == '---':
            dash_count += 1
            if dash_count == 2:
                frontmatter_end = i
                break
    
    if frontmatter_end == -1:
        print(f"❌ {os.path.basename(filepath)} - No frontmatter found, skipping")
        return False
    
    # Insert import after frontmatter
    import_line = 'import FeatureCoverage from "../../../../components/feature-coverage/FeatureCoverage";\n'
    
    # Insert blank line and import
    lines.insert(frontmatter_end + 1, '\n')
    lines.insert(frontmatter_end + 2, import_line)
    
    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"✅ {os.path.basename(filepath)} - Import added")
    return True

def main():
    services_dir = "src/content/docs/aws/services"
    
    if not os.path.exists(services_dir):
        print(f"Error: Directory {services_dir} does not exist")
        return
    
    # Get all .mdx files
    mdx_files = glob.glob(f"{services_dir}/*.mdx")
    
    if not mdx_files:
        print(f"No .mdx files found in {services_dir}")
        return
    
    print(f"Processing {len(mdx_files)} MDX files...")
    
    processed = 0
    skipped = 0
    
    for filepath in mdx_files:
        if add_import_to_file(filepath):
            processed += 1
        else:
            skipped += 1
    
    print(f"\nSummary:")
    print(f"✅ Processed: {processed} files")
    print(f"⏭️  Skipped: {skipped} files")
    print(f"🎉 Done!")

if __name__ == "__main__":
    main() 