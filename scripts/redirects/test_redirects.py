#!/usr/bin/env python3
"""
Script to test redirects by checking if old URLs redirect to expected new URLs.
Uses the staging environment to test the redirect behavior.
"""

import json
import requests
import argparse
from urllib.parse import urlparse, urljoin
from pathlib import Path
import time
from typing import List, Tuple


class RedirectTester:
    def __init__(self, staging_base_url: str, timeout: int = 10):
        self.staging_base_url = staging_base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LocalStack-Redirect-Tester/1.0'
        })
    
    def test_redirect(self, old_path: str, expected_new_path: str) -> Tuple[bool, str, int, str]:
        """
        Test if old_path redirects to expected_new_path.
        
        Args:
            old_path: Path to test (e.g., "/user-guide/")
            expected_new_path: Expected redirect path (e.g., "/aws/user-guide/") or external URL
        
        Returns:
            (success, final_url, status_code, message)
        """
        try:
            # Build full staging URL from path
            staging_url = f"{self.staging_base_url}{old_path}"
            
            # Make request with redirect following
            response = self.session.get(
                staging_url, 
                allow_redirects=True, 
                timeout=self.timeout
            )
            
            final_url = response.url
            status_code = response.status_code
            
            # Determine expected URL based on whether it's external or internal
            parsed_expected = urlparse(expected_new_path)
            if parsed_expected.scheme in ('http', 'https'):
                # External URL - use as-is
                expected_full_url = expected_new_path
            else:
                # Internal path - combine with staging base URL
                expected_full_url = f"{self.staging_base_url}{expected_new_path}"
            
            # Normalize URLs for comparison (handle trailing slashes)
            def normalize_url_for_comparison(url):
                """Normalize URL for comparison by removing trailing slash from path"""
                parsed = urlparse(url)
                path = parsed.path.rstrip('/') if parsed.path != '/' else parsed.path
                return f"{parsed.scheme}://{parsed.netloc}{path}{('?' + parsed.query) if parsed.query else ''}{('#' + parsed.fragment) if parsed.fragment else ''}"
            
            normalized_final = normalize_url_for_comparison(final_url)
            normalized_expected = normalize_url_for_comparison(expected_full_url)
            
            # Check if redirect worked correctly
            if normalized_final == normalized_expected:
                return True, final_url, status_code, "✅ Redirect successful"
            else:
                return False, final_url, status_code, f"❌ Expected: {expected_full_url}, Got: {final_url}"
                
        except requests.exceptions.Timeout:
            return False, "", 0, "⏰ Request timeout"
        except requests.exceptions.RequestException as e:
            return False, "", 0, f"🔌 Request failed: {str(e)}"
        except Exception as e:
            return False, "", 0, f"💥 Unexpected error: {str(e)}"

    def test_all_redirects(self, config_file: Path) -> dict:
        """Test all redirects from the config file."""
        
        with open(config_file, 'r') as f:
            config = json.load(f)
        
        results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'details': []
        }
        
                 # Test AWS redirects
        if 'aws' in config:
            print(f"\n🔍 Testing AWS redirects...")
            aws_redirects = [r for r in config['aws'] if r.get('_note') != "MANUALLY REVIEW AND UPDATE new_link"]
            skipped_aws = len(config['aws']) - len(aws_redirects)
            
            if skipped_aws > 0:
                print(f"  ⏭️  Skipping {skipped_aws} AWS redirects with manual review notes")
            
            for i, redirect in enumerate(aws_redirects, 1):
                old_path = redirect['old_link']
                new_path = redirect['new_link']
                
                print(f"  [{i}] Testing: {old_path}")
                success, final_url, status_code, message = self.test_redirect(old_path, new_path)
                
                results['total'] += 1
                if success:
                    results['passed'] += 1
                    print(f"      {message}")
                else:
                    results['failed'] += 1
                    print(f"      {message}")
                
                results['details'].append({
                    'product': 'aws',
                    'old_url': old_path,
                    'expected_new_url': new_path,
                    'final_url': final_url,
                    'status_code': status_code,
                    'success': success,
                    'message': message
                })
                
                # Small delay to be respectful
                time.sleep(0.5)
        
                 # Test Snowflake redirects
        # if 'snowflake' in config:
        #     print(f"\n❄️  Testing Snowflake redirects...")
        #     snowflake_redirects = [r for r in config['snowflake'] if r.get('_note') != "MANUALLY REVIEW AND UPDATE new_link"]
        #     skipped_snowflake = len(config['snowflake']) - len(snowflake_redirects)
            
        #     if skipped_snowflake > 0:
        #         print(f"  ⏭️  Skipping {skipped_snowflake} Snowflake redirects with manual review notes")
            
        #     for i, redirect in enumerate(snowflake_redirects, 1):
        #         old_path = redirect['old_link']
        #         new_path = redirect['new_link']
                
        #         print(f"  [{i}] Testing: {old_path}")
        #         success, final_url, status_code, message = self.test_redirect(old_path, new_path)
                
        #         results['total'] += 1
        #         if success:
        #             results['passed'] += 1
        #             print(f"      {message}")
        #         else:
        #             results['failed'] += 1
        #             print(f"      {message}")
                
        #         results['details'].append({
        #             'product': 'snowflake',
        #             'old_url': old_path,
        #             'expected_new_url': new_path,
        #             'final_url': final_url,
        #             'status_code': status_code,
        #             'success': success,
        #             'message': message
        #         })
                
        #         # Small delay to be respectful
        #         time.sleep(0.5)
        
        return results

    def generate_report(self, results: dict, output_file: str = None):
        """Generate a detailed test report."""
        
        report = []
        report.append("# LocalStack Redirect Test Report")
        report.append(f"**Generated:** {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"**Staging URL:** {self.staging_base_url}")
        report.append("")
        report.append("## Summary")
        report.append(f"- **Total tests:** {results['total']}")
        report.append(f"- **Passed:** {results['passed']} ✅")
        report.append(f"- **Failed:** {results['failed']} ❌")
        report.append(f"- **Success rate:** {(results['passed'] / results['total'] * 100):.1f}%" if results['total'] > 0 else "- **Success rate:** N/A")
        report.append("")
        
        if results['failed'] > 0:
            report.append("## Failed Tests")
            for detail in results['details']:
                if not detail['success']:
                    report.append(f"### {detail['product'].upper()}: {detail['old_url']}")
                    report.append(f"- **Expected:** {detail['expected_new_url']}")
                    report.append(f"- **Got:** {detail['final_url']}")
                    report.append(f"- **Status:** {detail['status_code']}")
                    report.append(f"- **Message:** {detail['message']}")
                    report.append("")
        
        report.append("## All Test Details")
        for detail in results['details']:
            status_icon = "✅" if detail['success'] else "❌"
            report.append(f"### {status_icon} {detail['product'].upper()}: {detail['old_url']}")
            report.append(f"- **Expected:** {detail['expected_new_url']}")
            report.append(f"- **Final URL:** {detail['final_url']}")
            report.append(f"- **Status Code:** {detail['status_code']}")
            report.append(f"- **Message:** {detail['message']}")
            report.append("")
        
        report_text = "\n".join(report)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report_text)
            print(f"\n📋 Detailed report saved to: {output_file}")
        
        return report_text


def main():
    parser = argparse.ArgumentParser(description='Test LocalStack redirects')
    parser.add_argument('--config', default='redirects_config.json',
                       help='Path to JSON config file (default: redirects_config.json)')
    parser.add_argument('--staging-url', default='https://a5c92421.localstack-docs.pages.dev',
                       help='Staging base URL (default: https://a5c92421.localstack-docs.pages.dev)')
    parser.add_argument('--timeout', type=int, default=10,
                       help='Request timeout in seconds (default: 10)')
    parser.add_argument('--report', 
                       help='Save detailed report to file (optional)')
    
    args = parser.parse_args()
    
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"❌ Error: Config file '{config_path}' not found!")
        return 1
    
    print(f"🚀 Starting redirect tests...")
    print(f"📍 Staging URL: {args.staging_url}")
    print(f"⚙️  Config file: {config_path}")
    
    tester = RedirectTester(args.staging_url, args.timeout)
    
    try:
        results = tester.test_all_redirects(config_path)
        
        print(f"\n" + "="*50)
        print(f"📊 TEST RESULTS SUMMARY")
        print(f"="*50)
        print(f"Total tests: {results['total']}")
        print(f"Passed: {results['passed']} ✅")
        print(f"Failed: {results['failed']} ❌")
        
        if results['total'] > 0:
            success_rate = results['passed'] / results['total'] * 100
            print(f"Success rate: {success_rate:.1f}%")
            
            if args.report:
                tester.generate_report(results, args.report)
            
            return 0 if results['failed'] == 0 else 1
        else:
            print("No tests found in config file!")
            return 1
            
    except Exception as e:
        print(f"💥 Error running tests: {e}")
        return 1


if __name__ == "__main__":
    exit(main()) 
