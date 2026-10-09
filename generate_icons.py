import zlib
import struct
import os

def create_png(width, height, get_pixel):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0) # 8-bit RGBA
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data))
    
    # Raw image data with scanline filter byte 0
    raw = bytearray()
    for y in range(height):
        raw.append(0) # Filter type 0
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw.extend([r, g, b, a])
            
    # IDAT chunk
    compressed = zlib.compress(bytes(raw), 9)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed))
    
    # IEND chunk
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND'))
    return png

def get_icon_pixel(x, y, w, h):
    # Distance from center
    cx, cy = w / 2, h / 2
    dx = (x - cx) / cx
    dy = (y - cy) / cy
    r = (dx*dx + dy*dy) ** 0.5
    
    # Rounded badge box
    margin = 0.08
    if abs(dx) > (1 - margin) or abs(dy) > (1 - margin):
        corner_dx = max(0, abs(dx) - (1 - margin*2))
        corner_dy = max(0, abs(dy) - (1 - margin*2))
        if (corner_dx**2 + corner_dy**2)**0.5 > margin:
            return (0, 0, 0, 0) # transparent outer
            
    # Gradient background from dark orange to deep carbon
    if dy > 0.2:
        # Green / terrain hill
        hill_curve = 0.35 + 0.15 * (dx * 1.5)
        if dy > hill_curve:
            return (34, 197, 94, 255) # Green grass
        elif dy > hill_curve - 0.04:
            return (22, 163, 74, 255)
            
    # Sleek dark carbon racing gradient
    grad = int(18 + (1 - dy) * 20)
    bg_r = min(255, int(grad + (1 - dy) * 45))
    bg_g = min(255, int(grad + (1 - dy) * 20))
    bg_b = min(255, int(grad + 15))

    # Center glowing racing badge / flag
    if 0.2 < r < 0.6:
        glow = int((1.0 - (abs(r - 0.4) / 0.2)) * 180)
        return (min(255, 255), min(255, 107 + glow//2), min(255, glow//3), 255)
        
    return (bg_r, bg_g, bg_b, 255)

os.makedirs('assets', exist_ok=True)

with open('assets/icon-192.png', 'wb') as f:
    f.write(create_png(192, 192, get_icon_pixel))

with open('assets/icon-512.png', 'wb') as f:
    f.write(create_png(512, 512, get_icon_pixel))

print("Successfully generated assets/icon-192.png and assets/icon-512.png")
