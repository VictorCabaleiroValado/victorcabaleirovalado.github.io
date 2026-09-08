"""Plot an actual demo measurement; no generated or reconstructed signal."""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[1]
e=next(e for e in json.loads((ROOT/'public/demo/data.json').read_text())['examples'] if e['id']==402)
signal=e['signal'];lo=min(y for x,y in signal);hi=max(y for x,y in signal);pad=(hi-lo)*.08;lo-=pad;hi+=pad
x0,x1,y0,y1=100,1500,215,690
points=' '.join(f'{x0+x/(e["samples"]-1)*(x1-x0):.2f},{y1-(y-lo)/(hi-lo)*(y1-y0):.2f}' for x,y in signal)
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">','<rect width="1600" height="900" fill="#0b1119"/>','<g font-family="Arial,sans-serif">','<text x="80" y="65" fill="#a8c5f4" font-size="20" letter-spacing="2">FAULT DIAGNOSIS IN ROTARY MACHINES</text>','<text x="80" y="124" fill="#f0f5fc" font-size="44" font-weight="600">Vibration signal</text>',f'<text x="80" y="169" fill="#afbdce" font-size="23">{html.escape(e["label"])}</text>','<text x="1500" y="124" fill="#a8c5f4" text-anchor="end" font-size="22">Motor channel · 25 RPM</text>']
for i in range(5):
 val=lo+(hi-lo)*i/4;y=y1-i*(y1-y0)/4
 svg+=[f'<path d="M100 {y} H1500" stroke="#26364a"/>',f'<text x="84" y="{y+6}" text-anchor="end" fill="#8ea3bf" font-size="18">{val:.3f}</text>']
svg += [f'<polyline points="{points}" fill="none" stroke="#b7d0ff" stroke-width="1.6"/>','<text x="100" y="726" fill="#8ea3bf" font-size="18">0</text>','<text x="1500" y="726" text-anchor="end" fill="#8ea3bf" font-size="18">63,999</text>','<text x="100" y="767" fill="#afbdce" font-size="20">Sensor value · original recorded scale</text>','<text x="1500" y="767" text-anchor="end" fill="#afbdce" font-size="20">Sample index →</text>','<path d="M80 803 H1520" stroke="#26364a"/>','<text x="80" y="850" fill="#afbdce" font-size="22">64,000 source samples · 9 recorded channels · Real measurement from the interactive demo</text>','</g></svg>']
(ROOT/'public/vibration-signal-cover.svg').write_text('\n'.join(svg))
print(e['source'],len(signal))
