#!/usr/bin/env python3
"""
Helper script to generate a template JSON config from scraped URLs.
This makes it easier to manually map old URLs to new URLs.
"""

import json
import argparse
from pathlib import Path
from urllib.parse import urlparse
from scrap_sitemap import get_urls_of_xml


def generate_config_template(aws_urls=None, snowflake_urls=None, output_file="redirects_config_template.json", base_url="https://docs.localstack.cloud"):
    """Generate a template JSON config with URLs to be manually mapped."""
    
    config = {}
    
    # Process AWS URLs
    if aws_urls:
        config["aws"] = []
        for url in aws_urls:
            parsed = urlparse(url)
            old_path = parsed.path
            # Ensure path starts with /
            if not old_path.startswith('/'):
                old_path = '/' + old_path
            
            # Extract meaningful path parts for suggested new path
            path_parts = [p for p in parsed.path.split('/') if p]
            suggested_new_path = '/'.join(path_parts) if path_parts else ''
            new_path = f"/aws/{suggested_new_path}" if suggested_new_path else "/aws/"
            
            config["aws"].append({
                "old_link": old_path,
                "new_link": new_path,
                "status_code": 301,
                "_note": "MANUALLY REVIEW AND UPDATE new_link"
            })
    
    # Process Snowflake URLs  
    if snowflake_urls:
        config["snowflake"] = []
        for url in snowflake_urls:
            parsed = urlparse(url)
            old_path = parsed.path
            # Ensure path starts with /
            if not old_path.startswith('/'):
                old_path = '/' + old_path
            
            # Extract meaningful path parts for suggested new path
            path_parts = [p for p in parsed.path.split('/') if p]
            suggested_new_path = '/'.join(path_parts) if path_parts else ''
            new_path = f"/snowflake/{suggested_new_path}" if suggested_new_path else "/snowflake/"
            
            config["snowflake"].append({
                "old_link": old_path,
                "new_link": new_path,
                "status_code": 301,
                "_note": "MANUALLY REVIEW AND UPDATE new_link"
            })
    
    # Write to file
    with open(output_file, 'w') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    total_urls = len(config.get('aws', [])) + len(config.get('snowflake', []))
    print(f"✅ Generated template config with {total_urls} URLs")
    print(f"📝 File: {output_file}")
    print(f"📍 All URLs are path-based (no domain) for flexibility")
    print(f"\n🔧 Next steps:")
    print(f"   1. Review and update the 'new_link' values in {output_file}")
    print(f"   2. Remove the '_note' fields when done")
    print(f"   3. Use generate_redirects.py to create the _redirects file")


def load_urls_from_sitemap(sitemap_url):
    """Load URLs from a sitemap XML."""
    try:
        return get_urls_of_xml(sitemap_url)
    except Exception as e:
        print(f"❌ Error loading sitemap from {sitemap_url}: {e}")
        return []


def load_urls_from_file(file_path):
    """Load URLs from a text file (one URL per line)."""
    try:
        with open(file_path, 'r') as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        return urls
    except Exception as e:
        print(f"❌ Error loading URLs from {file_path}: {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description='Generate redirect config template from URLs')
    parser.add_argument('--aws-sitemap', 
                       help='AWS sitemap URL (e.g., https://docs.localstack.cloud/sitemap.xml)')
    parser.add_argument('--snowflake-sitemap',
                       help='Snowflake sitemap URL (e.g., https://snowflake.localstack.cloud/sitemap.xml)')
    parser.add_argument('--aws-file',
                       help='Text file with AWS URLs (one per line)')
    parser.add_argument('--snowflake-file', 
                       help='Text file with Snowflake URLs (one per line)')
    parser.add_argument('--base-url', default='https://docs.localstack.cloud',
                       help='Base URL for new links (default: https://docs.localstack.cloud)')
    parser.add_argument('--output', default='redirects_config_template.json',
                       help='Output template file (default: redirects_config_template.json)')
    
    args = parser.parse_args()
    
    aws_urls = []
    snowflake_urls = []
    
    # Load AWS URLs
    if args.aws_sitemap:
        print(f"🔍 Loading AWS URLs from sitemap: {args.aws_sitemap}")
        aws_urls.extend(load_urls_from_sitemap(args.aws_sitemap))
        print(f"   Found {len(aws_urls)} AWS URLs")
    
    if args.aws_file:
        print(f"📄 Loading AWS URLs from file: {args.aws_file}")
        file_urls = load_urls_from_file(args.aws_file)
        aws_urls.extend(file_urls)
        print(f"   Added {len(file_urls)} AWS URLs from file")
    
    # Load Snowflake URLs
    if args.snowflake_sitemap:
        print(f"❄️  Loading Snowflake URLs from sitemap: {args.snowflake_sitemap}")
        snowflake_urls.extend(load_urls_from_sitemap(args.snowflake_sitemap))
        print(f"   Found {len(snowflake_urls)} Snowflake URLs")
        
    if args.snowflake_file:
        print(f"📄 Loading Snowflake URLs from file: {args.snowflake_file}")
        file_urls = load_urls_from_file(args.snowflake_file)
        snowflake_urls.extend(file_urls)
        print(f"   Added {len(file_urls)} Snowflake URLs from file")
    
    # Remove duplicates
    aws_urls = list(set(aws_urls))
    snowflake_urls = list(set(snowflake_urls))
    
    if not aws_urls and not snowflake_urls:
        print("❌ No URLs found! Please provide at least one source of URLs.")
        print("   Use --aws-sitemap, --snowflake-sitemap, --aws-file, or --snowflake-file")
        return 1
    
    print(f"\n📊 Summary:")
    print(f"   AWS URLs: {len(aws_urls)}")
    print(f"   Snowflake URLs: {len(snowflake_urls)}")
    print(f"   Total: {len(aws_urls) + len(snowflake_urls)}")
    
    # Generate template
    generate_config_template(aws_urls, snowflake_urls, args.output, args.base_url)
    
    return 0


if __name__ == "__main__":
    exit(main()) 