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
            expected_new_path: Expected redirect path (e.g., "/aws/user-guide/")
        
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
            
            # Build expected full URL
            expected_staging_url = f"{self.staging_base_url}{expected_new_path}"
            
            # Check if redirect worked correctly
            if final_url == expected_staging_url:
                return True, final_url, status_code, "✅ Redirect successful"
            else:
                return False, final_url, status_code, f"❌ Expected: {expected_staging_url}, Got: {final_url}"
                
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
            for i, redirect in enumerate(config['aws'], 1):
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
        if 'snowflake' in config:
            print(f"\n❄️  Testing Snowflake redirects...")
            for i, redirect in enumerate(config['snowflake'], 1):
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
                    'product': 'snowflake',
                    'old_url': old_path,
                    'expected_new_url': new_path,
                    'final_url': final_url,
                    'status_code': status_code,
                    'success': success,
                    'message': message
                })
                
                # Small delay to be respectful
                time.sleep(0.5)
        
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