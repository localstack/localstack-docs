# LocalStack Docs Redirect Management

This directory contains scripts to help manage redirects for LocalStack's docs migration from:
- `docs.localstack.cloud` → `docs.localstack.cloud/aws/`
- `snowflake.localstack.cloud` → `docs.localstack.cloud/snowflake/`

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `scrap_sitemap.py` | Extract URLs from XML sitemaps |
| `generate_config_template.py` | Generate JSON template from scraped URLs |
| `redirects_config.json` | Manual redirect mappings (you edit this) |
| `generate_redirects.py` | Convert JSON config to CloudFlare `_redirects` format |
| `test_redirects.py` | Test redirects against staging environment |

## 🚀 Workflow

### 1. Scrape Existing URLs

First, get all URLs from your current sites:

```bash
# Get AWS docs URLs
python scrap_sitemap.py > aws_urls.txt

# Or for Snowflake (modify the script URL)
# Edit scrap_sitemap.py to change the sitemap URL to snowflake.localstack.cloud
```

### 2. Generate Config Template

Create a template JSON config with all URLs:

```bash
# From sitemaps directly
python generate_config_template.py \
  --aws-sitemap "https://docs.localstack.cloud/sitemap.xml" \
  --snowflake-sitemap "https://snowflake.localstack.cloud/sitemap.xml" \
  --output redirects_config_template.json

# Or from saved URL files
python generate_config_template.py \
  --aws-file aws_urls.txt \
  --snowflake-file snowflake_urls.txt \
  --output redirects_config_template.json
```

### 3. Manual Mapping

Edit the generated template to map old URLs to new URLs:

```json
{
  "aws": [
    {
      "old_link": "https://docs.localstack.cloud/getting-started/",
      "new_link": "https://docs.localstack.cloud/aws/getting-started/",
      "status_code": 301
    }
  ],
  "snowflake": [
    {
      "old_link": "https://snowflake.localstack.cloud/features/",
      "new_link": "https://docs.localstack.cloud/snowflake/features/",
      "status_code": 301
    }
  ]
}
```

**Important:**
- Remove the `_note` fields after manual review
- Update `new_link` values to match your actual new URL structure
- Save as `redirects_config.json`

### 4. Generate CloudFlare Redirects

Convert your JSON config to CloudFlare's `_redirects` format:

```bash
python generate_redirects.py \
  --config redirects_config.json \
  --output _redirects
```

This creates a `_redirects` file like:
```
# LocalStack Docs Redirects
# Generated automatically from redirects_config.json

# Static redirects
/getting-started/ /aws/getting-started/ 301
/user-guide/ /aws/capabilities/ 301
```

### 5. Test Redirects

Test your redirects against the staging environment:

```bash
python test_redirects.py \
  --config redirects_config.json \
  --staging-url "https://a5c92421.localstack-docs.pages.dev" \
  --report redirect_test_report.md
```

This will:
- Test each redirect against your staging URL
- Show pass/fail results in real-time
- Generate a detailed markdown report

## 🛠️ Script Details

### `generate_config_template.py`

Generate a JSON template from scraped URLs.

```bash
python generate_config_template.py --help
```

**Options:**
- `--aws-sitemap URL` - Load AWS URLs from sitemap
- `--snowflake-sitemap URL` - Load Snowflake URLs from sitemap  
- `--aws-file FILE` - Load AWS URLs from text file
- `--snowflake-file FILE` - Load Snowflake URLs from text file
- `--output FILE` - Output template file

### `generate_redirects.py`

Convert JSON config to CloudFlare `_redirects` format.

```bash
python generate_redirects.py --help
```

**Options:**
- `--config FILE` - JSON config file (default: `redirects_config.json`)
- `--output FILE` - Output redirects file (default: `_redirects`)

### `test_redirects.py`

Test redirects against staging environment.

```bash
python test_redirects.py --help
```

**Options:**
- `--config FILE` - JSON config file
- `--staging-url URL` - Staging base URL  
- `--timeout SECONDS` - Request timeout
- `--report FILE` - Save detailed report to file

## 📋 CloudFlare Setup

1. Upload the generated `_redirects` file to your CloudFlare Pages project root
2. CloudFlare will automatically apply the redirects
3. Test with your staging URL first before going live

**CloudFlare Limits:**
- Max 2,000 static redirects
- Max 100 dynamic redirects  
- Max 2,100 total redirects
- 1,000 character limit per redirect

## 🧪 Testing Strategy

1. **Staging First**: Always test with staging URL
2. **Sample Testing**: Test a subset of critical URLs manually
3. **Automated Testing**: Run the test script regularly
4. **Monitor**: Check for 404s after going live

## 📝 Example Complete Workflow

```bash
# 1. Generate template from sitemaps
python generate_config_template.py \
  --aws-sitemap "https://docs.localstack.cloud/sitemap.xml" \
  --snowflake-sitemap "https://snowflake.localstack.cloud/sitemap.xml"

# 2. Manually edit redirects_config_template.json → redirects_config.json

# 3. Generate CloudFlare redirects file
python generate_redirects.py

# 4. Test redirects
python test_redirects.py --report test_results.md

# 5. Upload _redirects file to CloudFlare Pages
```

## 🚨 Important Notes

- **Manual Review Required**: Always manually review and update the generated mappings
- **URL Structure**: Ensure new URLs match your actual site structure
- **Status Codes**: Use 301 for permanent redirects, 302 for temporary
- **Testing**: Test thoroughly on staging before production
- **Staging URL**: Update staging URL as needed in commands

## 🆘 Troubleshooting

**Common Issues:**

1. **Import Error**: Make sure `requests` and `beautifulsoup4` are installed:
   ```bash
   pip install requests beautifulsoup4
   ```

2. **Sitemap Not Found**: Check sitemap URLs are correct and accessible

3. **Redirect Not Working**: 
   - Verify the `_redirects` file is in the correct location
   - Check CloudFlare Pages build logs
   - Ensure paths match exactly

4. **Too Many Redirects**: Check for redirect loops in your mappings

## 📚 Resources

- [CloudFlare Pages Redirects Documentation](https://developers.cloudflare.com/pages/configuration/redirects/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 