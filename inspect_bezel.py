import urllib.request
import re
import json

req = urllib.request.Request(
    'https://bezel.fit',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

with open('bezel_page.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Page length:", len(html))

# Find script tags
scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
print("Scripts found:", len(scripts))
for s in scripts:
    print(" -", s)

# Search for any device mentions in HTML
devices = re.findall(r'iphone[a-zA-Z0-9_-]*|ipad[a-zA-Z0-9_-]*', html, re.IGNORECASE)
print("Devices in HTML:", set(devices[:30]))
