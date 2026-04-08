/**
 * Icon detection utility — shared by BrandIcon and parent components
 * Reads SVG viewBox at BUILD TIME to determine aspect ratio and logo type
 */
import fs from "node:fs";
import path from "node:path";

export interface IconInfo {
  file: string | null;
  format: "svg" | "png" | null;
  ratio: number; // width/height — 1.0 = square, 3.0 = wide logotype
  isLogotype: boolean; // true if ratio > 1.8 (text-based logo, don't show text next to it)
}

const iconsDir = path.join(process.cwd(), "public", "icons");

export function getIconInfo(name: string): IconInfo {
  const key = name.toLowerCase().replace(/[\s./+#\-]+/g, "");

  const candidates = [
    key,
    key.replace("apache", ""),
    name.toLowerCase().replace(/\s+/g, "-"),
    name.split(/\s+/)[0].toLowerCase(),
  ];

  for (const candidate of candidates) {
    const svgPath = path.join(iconsDir, `${candidate}.svg`);
    if (fs.existsSync(svgPath)) {
      // Read viewBox to get aspect ratio
      const content = fs.readFileSync(svgPath, "utf8");
      const vbMatch = content.match(/viewBox=["'][-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)["']/);
      let ratio = 1;
      if (vbMatch) {
        ratio = parseFloat(vbMatch[1]) / parseFloat(vbMatch[2]);
      }
      return {
        file: `${candidate}.svg`,
        format: "svg",
        ratio,
        isLogotype: ratio > 1.8,
      };
    }

    const pngPath = path.join(iconsDir, `${candidate}.png`);
    if (fs.existsSync(pngPath)) {
      return { file: `${candidate}.png`, format: "png", ratio: 1, isLogotype: false };
    }
  }

  return { file: null, format: null, ratio: 1, isLogotype: false };
}
