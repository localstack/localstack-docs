#!/usr/bin/env python3
"""
Script to generate CloudFlare _redirects file from JSON configuration.
Converts redirect mappings to CloudFlare Pages redirect format.
"""

import json
import argparse
from urllib.parse import urlparse
from pathlib import Path


def normalize_path(path):
    """Normalize a path to ensure it starts with / and handle trailing slashes."""
    if not path.startswith('/'):
        path = '/' + path
    # Keep trailing slash behavior as-is for now
    return path


def generate_redirects_file(config_file, output_file):
    """Generate CloudFlare _redirects file from JSON config."""
    
    # Load configuration
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    redirects = []
    
    skipped_count = 0
    
    # Process AWS redirects
    if 'aws' in config:
        for redirect in config['aws']:
            # Skip entries that still have the manual review note
            if redirect.get('_note') == "MANUALLY REVIEW AND UPDATE new_link":
                skipped_count += 1
                continue
                
            old_path = normalize_path(redirect['old_link'])
            new_path = normalize_path(redirect['new_link'])
            status_code = redirect.get('status_code', 301)
            
            redirects.append(f"{old_path} {new_path} {status_code}")
    
    # Process Snowflake redirects  
    # if 'snowflake' in config:
    #     for redirect in config['snowflake']:
    #         # Skip entries that still have the manual review note
    #         if redirect.get('_note') == "MANUALLY REVIEW AND UPDATE new_link":
    #             skipped_count += 1
    #             continue
                
    #         old_path = normalize_path(redirect['old_link'])
    #         new_path = normalize_path(redirect['new_link'])
    #         status_code = redirect.get('status_code', 301)
            
    #         redirects.append(f"{old_path} {new_path} {status_code}")
    
    # Write to output file
    with open(output_file, 'w') as f:
        for redirect in redirects:
            f.write(f"{redirect}\n")
    
    print(f"Generated {len(redirects)} redirects in {output_file}")
    
    if skipped_count > 0:
        print(f"⚠️  Skipped {skipped_count} entries that still need manual review")
        print(f"   Remove '_note' field from reviewed entries to include them")


def main():
    parser = argparse.ArgumentParser(description='Generate CloudFlare _redirects file from JSON config')
    parser.add_argument('--config', default='redirects_config.json', 
                       help='Path to JSON config file (default: redirects_config.json)')
    parser.add_argument('--output', default='_redirects',
                       help='Output file path (default: _redirects)')
    
    args = parser.parse_args()
    
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"Error: Config file '{config_path}' not found!")
        return 1
    
    try:
        generate_redirects_file(config_path, args.output)
        print(f"\n✅ Successfully generated {args.output}")
        print(f"📋 You can now upload this file to your CloudFlare Pages project")
        
    except Exception as e:
        print(f"❌ Error generating redirects: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main()) 