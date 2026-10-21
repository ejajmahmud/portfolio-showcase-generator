from PIL import Image

sc = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\test_captures\test_showcase.png')
thumb = sc.resize((300, 225), Image.Resampling.LANCZOS)
thumb.save(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\test_captures\test_thumb.png')

print("Thumb saved: 300x225")
