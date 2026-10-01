from pathlib import Path

from PIL import Image

src = Path(r"C:\Users\ADMIN\.cursor\projects\c-Users-ADMIN-Desktop-AI-Recipe-App\assets")
dst = Path(r"C:\Users\ADMIN\Desktop\AI Recipe App\ai-recipe-app\assets\images")
dst.mkdir(parents=True, exist_ok=True)


def first_existing(paths: list[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError(paths)


icon_src = first_existing([src / "snapchef-icon.png", src / "snapchef-icon.jpg"])
fg_src = first_existing(
    [src / "snapchef-android-foreground.png", src / "snapchef-android-foreground.jpg"]
)
splash_src = first_existing(
    [
        src / "snapchef-splash.png",
        src / "snapchef-splash.jpg",
        src / "snapchef-splash-mark.png",
        icon_src,
    ]
)

print("icon:", icon_src)
print("fg:", fg_src)
print("splash:", splash_src)

# Main app icon 1024
icon = Image.open(icon_src).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
icon.save(dst / "icon.png", "PNG", optimize=True)
print("saved icon.png")

# Favicon
icon.resize((48, 48), Image.Resampling.LANCZOS).save(dst / "favicon.png", "PNG", optimize=True)
print("saved favicon.png")

# Splash
splash = Image.open(splash_src).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
splash.save(dst / "splash-icon.png", "PNG", optimize=True)
print("saved splash-icon.png")

# Android adaptive foreground with dark bg punched to transparent
fg = Image.open(fg_src).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
pixels = fg.load()
w, h = fg.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3
        if brightness < 55 and b >= r * 0.7:
            pixels[x, y] = (r, g, b, 0)
        elif r < 40 and g < 35 and b < 70:
            pixels[x, y] = (r, g, b, 0)

bbox = fg.getbbox()
canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
if bbox:
    cropped = fg.crop(bbox)
    max_side = 675
    cw, ch = cropped.size
    scale = min(max_side / cw, max_side / ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (1024 - nw) // 2
    oy = (1024 - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
else:
    canvas = fg

canvas.save(dst / "android-icon-foreground.png", "PNG", optimize=True)
print("saved android-icon-foreground.png")

# Solid adaptive background matching brand splash purple
Image.new("RGBA", (1024, 1024), (42, 31, 74, 255)).save(
    dst / "android-icon-background.png", "PNG", optimize=True
)
print("saved android-icon-background.png")
print("done")
