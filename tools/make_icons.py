"""Draw the app icons (PNG) with plain Python, no image library needed.

Run once: .venv\\Scripts\\python tools\\make_icons.py  -> static/icons/*.png
The drawing is the header logo: three bars on the purple gradient.
"""
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "static" / "icons"
C1, C2 = (0x4F, 0x46, 0xE5), (0x7C, 0x3A, 0xED)        # same gradient as the dashboard logo
BARS = [(3, 12, 4, 9), (10, 7, 4, 14), (17, 3, 4, 18)]  # x, y, w, h in the 24-unit box of the header SVG


def in_round_rect(x, y, x0, y0, x1, y1, r):
    dx = max(x0 + r - x, 0.0, x - (x1 - r))
    dy = max(y0 + r - y, 0.0, y - (y1 - r))
    return dx * dx + dy * dy <= r * r


def render(size, maskable, ss=2):
    """RGBA rows of a size x size icon, drawn at ss x resolution then averaged (smooth edges)."""
    n = size * ss
    scale = (0.50 if maskable else 0.60) * n / 24      # maskable icons keep the logo inside the safe zone
    off = (n - 24 * scale) / 2
    corner = 0 if maskable else 0.22 * n
    bars = [(off + x * scale, off + y * scale, off + (x + w) * scale, off + (y + h) * scale) for x, y, w, h in BARS]
    radius = 1.5 * scale
    big = bytearray(n * n * 4)
    for y in range(n):
        fy = y + 0.5
        row = y * n * 4
        for x in range(n):
            fx = x + 0.5
            if not maskable and not in_round_rect(fx, fy, 0, 0, n, n, corner):
                continue
            t = (fx + fy) / (2 * n)
            r, g, b = (int(C1[i] + (C2[i] - C1[i]) * t) for i in range(3))
            for x0, y0, x1, y1 in bars:
                if in_round_rect(fx, fy, x0, y0, x1, y1, radius):
                    r = g = b = 255
                    break
            i = row + x * 4
            big[i], big[i + 1], big[i + 2], big[i + 3] = r, g, b, 255
    rows = []
    area = ss * ss
    for y in range(size):
        line = bytearray()
        for x in range(size):
            sr = sg = sb = sa = 0
            for yy in range(y * ss, y * ss + ss):
                base = yy * n * 4 + x * ss * 4
                for xx in range(ss):
                    i = base + xx * 4
                    a = big[i + 3]
                    sr += big[i] * a
                    sg += big[i + 1] * a
                    sb += big[i + 2] * a
                    sa += a
            if sa:
                line += bytes((sr // sa, sg // sa, sb // sa, sa // area))
            else:
                line += b"\0\0\0\0"
        rows.append(bytes(line))
    return rows


def png(size, rows):
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    raw = b"".join(b"\0" + r for r in rows)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, size, maskable in (("icon-512.png", 512, False), ("icon-maskable-512.png", 512, True),
                                 ("icon-192.png", 192, False), ("apple-touch-icon.png", 180, False)):
        (OUT / name).write_bytes(png(size, render(size, maskable, ss=2 if size >= 512 else 3)))
        print("wrote", name)
    (OUT / "icon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/>'
        '<stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>'
        '<rect width="64" height="64" rx="14" fill="url(#g)"/>'
        '<g fill="#fff" transform="translate(12 12) scale(1.6667)"><rect x="3" y="12" width="4" height="9" rx="1.5"/>'
        '<rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></g></svg>\n',
        encoding="utf-8")
    print("wrote icon.svg")


if __name__ == "__main__":
    main()
