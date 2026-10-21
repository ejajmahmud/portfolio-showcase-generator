with open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\bezel_index.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Search for canvas, drawImage, borderRadius, clip
for kw in ['drawImage', 'createCanvas', 'clip', 'roundRect', 'arcTo', 'border-radius', 'viewport']:
    idx = 0
    print(f"=== Keyword: {kw} ===")
    while True:
        pos = js.find(kw, idx)
        if pos == -1:
            break
        print(js[max(0, pos-40):min(len(js), pos+120)])
        idx = pos + len(kw) + 20
        if idx > pos + 1000:
            break
