import urllib.request
import re

req = urllib.request.Request(
    'https://bezel.fit/assets/index-DkWJvv_w.js',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
js_content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

with open('bezel_index.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("JS length:", len(js_content))

# Look for iphone-17-pro-max or device definitions
matches = re.findall(r'iphone-17-pro-max[^\n]{0,200}', js_content)
for m in matches[:10]:
    print("Match:", m)

# Search for colors, blue, frames, assets
assets = set(re.findall(r'["\'](/assets/[^"\']+\.(?:png|svg|webp|jpg))["\']', js_content))
print("Assets found in JS:", len(assets))
for a in list(assets)[:20]:
    print(" -", a)
