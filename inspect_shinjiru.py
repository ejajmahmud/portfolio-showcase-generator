import re
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.shinjiru.com.my/web-design/web-design-portfolio/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

with open('shinjiru_portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"HTML length: {len(html)}")

# Search for select tags
selects = re.findall(r'<select[^>]*>.*?</select>', html, re.DOTALL | re.IGNORECASE)
print(f"Select tags found: {len(selects)}")
for s in selects:
    print("--- SELECT ---")
    print(s[:500])

# Look for data-filter
data_filters = set(re.findall(r'data-filter=["\']([^"\']+)["\']', html, re.IGNORECASE))
print("Data filters:", data_filters)

# Look for filter nav items, tab items, or portfolio items
items = re.findall(r'<li[^>]*class=["\'][^"\']*(?:filter|portfolio|category)[^"\']*["\'][^>]*>.*?</li>', html, re.DOTALL | re.IGNORECASE)
print(f"Filter LI items found: {len(items)}")
for it in items[:15]:
    print(" ", re.sub(r'<[^>]+>', '', it).strip())
