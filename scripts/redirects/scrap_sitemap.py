from bs4 import BeautifulSoup
import requests

def get_urls_of_xml(xml_url):
    r = requests.get(xml_url)
    xml = r.text
    soup = BeautifulSoup(xml)

    links_arr = []
    for link in soup.findAll('loc'):
        linkstr = link.getText('', True)
        links_arr.append(linkstr)

    return links_arr

links_data_arr = get_urls_of_xml("https://snowflake.localstack.cloud/sitemap.xml")
for link in links_data_arr:
    print(f"{link}")
