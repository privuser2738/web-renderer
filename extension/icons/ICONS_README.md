# Extension Icons

This folder should contain the extension icons in the following sizes:

## Required Icons

- `icon16.png` - 16x16px - Browser toolbar
- `icon48.png` - 48x48px - Extension management page
- `icon128.png` - 128x128px - Chrome Web Store

## Optional (for disabled state)

- `icon16-disabled.png` - 16x16px (grayscale)
- `icon48-disabled.png` - 48x48px (grayscale)
- `icon128-disabled.png` - 128x128px (grayscale)

## Design Guidelines

### Style
- Modern, clean design
- Use the brand colors: #667eea (purple-blue) and #764ba2 (purple)
- Icon should work on both light and dark backgrounds
- Consider using a "WR" monogram or a page/layers symbol

### Symbolism Ideas
- Stacked pages/layers (representing pagination)
- A viewport/frame icon
- A responsive grid icon
- The letters "WR" in a modern font

### Tools
You can create these icons using:
- Figma
- Adobe Illustrator
- Sketch
- Online icon generators

### Quick Placeholder
For development, you can use a simple colored square with "WR" text:
- Background: #667eea
- Text: white, bold, centered
- Font: Sans-serif

## Example Generation (using ImageMagick)

```bash
# Create a simple placeholder
convert -size 128x128 xc:#667eea -pointsize 48 -fill white -gravity center -annotate +0+0 "WR" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png

# Disabled versions (grayscale)
convert icon128.png -colorspace Gray icon128-disabled.png
convert icon48.png -colorspace Gray icon48-disabled.png
convert icon16.png -colorspace Gray icon16-disabled.png
```
