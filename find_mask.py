import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\bezel_index.js', 'r', encoding='utf-8') as f:
    js = f.read()

pos = js.find('function m(')
if pos != -1:
    print(js[pos:pos+400])
