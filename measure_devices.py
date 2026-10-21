from PIL import Image
import numpy as np

img = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item1_dalwa7.png').convert('RGB')
arr = np.array(img)
mask = np.any(arr < 245, axis=2)

# Mobile bbox: columns 14 to 70
m_mask = mask[:, 14:70]
my, mx = np.where(m_mask)
print(f"Mobile in Dalwa7: y={my.min()}..{my.max()} (h={my.max()-my.min()+1}), x={mx.min()+14}..{mx.max()+14} (w={mx.max()-mx.min()+1})")

# Tablet bbox: columns 105 to 198
t_mask = mask[:, 105:198]
ty, tx = np.where(t_mask)
print(f"Tablet in Dalwa7: y={ty.min()}..{ty.max()} (h={ty.max()-ty.min()+1}), x={tx.min()+105}..{tx.max()+105} (w={tx.max()-tx.min()+1})")

# Let's check item0 (Capace) as well
img0 = Image.open(r'C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator\item0_capace.png').convert('RGB')
arr0 = np.array(img0)
mask0 = np.any(arr0 < 245, axis=2)
# find phone and tablet in item0
m0_mask = mask0[:, :70]
m0y, m0x = np.where(m0_mask)
print(f"Mobile in Capace: y={m0y.min()}..{m0y.max()} (h={m0y.max()-m0y.min()+1}), x={m0x.min()}..{m0x.max()} (w={m0x.max()-m0x.min()+1})")

t0_mask = mask0[:, 100:]
t0y, t0x = np.where(t0_mask)
print(f"Tablet in Capace: y={t0y.min()}..{t0y.max()} (h={t0y.max()-t0y.min()+1}), x={t0x.min()+100}..{t0x.max()+100} (w={t0x.max()-t0x.min()+1})")

# Desktop in Capace:
d0_mask = mask0[:80, :]
d0y, d0x = np.where(d0_mask)
print(f"Desktop in Capace: y={d0y.min()}..{d0y.max()} (h={d0y.max()-d0y.min()+1}), x={d0x.min()}..{d0x.max()} (w={d0x.max()-d0x.min()+1})")
