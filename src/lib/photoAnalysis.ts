/**
 * Smart Cataloguing photo analysis — measures the artisan's ACTUAL uploaded
 * photo. The image is decoded by the browser, drawn to a canvas and sampled
 * on a 6×5 grid; brightness, contrast, saturation, the top palette swatches
 * and the aspect ratio all come from the real pixel data. The measurements
 * are sent to the `smartCatalogue` Convex action, which derives the catalog
 * fields from those measurements plus the artisan's spoken words.
 */

export type MeasuredPhoto = {
  ok: boolean;
  width: number;
  height: number;
  aspect: "tall" | "square" | "wide";
  brightness: number; // 0-100 average luminance
  contrast: number; // 0-100 spread of luminance
  saturation: number; // 0-100 average colorfulness
  colorHexes: string[]; // top hex swatches, most colorful first
  light: "bright and evenly lit" | "soft light" | "low light";
};

const MAX_DIMENSION = 640; // sampled down for speed; measurements unaffected

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Loads the file into an <img> via object URL, draws it to a canvas and
 * samples a 6×5 grid of cells. Returns the measured analysis, or
 * `{ ok: false }` if the image can't be decoded (still safe to call).
 */
export async function analyzePhotoFile(file: File): Promise<MeasuredPhoto> {
  const empty: MeasuredPhoto = {
    ok: false,
    width: 0,
    height: 0,
    aspect: "square",
    brightness: 0,
    contrast: 0,
    saturation: 0,
    colorHexes: [],
    light: "soft light",
  };
  if (!file.type.startsWith("image/")) return empty;

  try {
    const objectUrl = URL.createObjectURL(file);
    let img: HTMLImageElement;
    try {
      img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode failed"));
        el.src = objectUrl;
      });
    } finally {
      // Revoke after decode; the decoded bitmap stays alive in the canvas.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return empty;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    // Sample a 6×5 grid of cells, averaging each cell's pixels.
    const COLS = 6;
    const ROWS = 5;
    const cells: Array<{ r: number; g: number; b: number }> = [];
    for (let cy = 0; cy < ROWS; cy++) {
      for (let cx = 0; cx < COLS; cx++) {
        const x0 = Math.floor((cx * w) / COLS);
        const y0 = Math.floor((cy * h) / ROWS);
        const x1 = Math.floor(((cx + 1) * w) / COLS);
        const y1 = Math.floor(((cy + 1) * h) / ROWS);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        const stepX = Math.max(1, Math.floor((x1 - x0) / 12));
        const stepY = Math.max(1, Math.floor((y1 - y0) / 12));
        for (let y = y0; y < y1; y += stepY) {
          for (let x = x0; x < x1; x += stepX) {
            const i = (y * w + x) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
          }
        }
        cells.push({ r: r / n, g: g / n, b: b / n });
      }
    }

    const luminance = (c: { r: number; g: number; b: number }) =>
      0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    const brightness = (cells.reduce((s, c) => s + luminance(c), 0) / cells.length) / 2.55;
    const lums = cells.map(luminance);
    const meanLum = lums.reduce((s, l) => s + l, 0) / lums.length;
    const contrast =
      (Math.sqrt(lums.reduce((s, l) => s + (l - meanLum) ** 2, 0) / lums.length) / 255) * 200;
    const saturation =
      ((cells.reduce(
        (s, c) => s + (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)),
        0,
      ) /
        cells.length /
        255) *
        100);

    // Top palette: rank cells by colorfulness so a colorful craft wins
    // over a neutral background.
    const ranked = [...cells]
      .sort(
        (a, b) =>
          Math.max(b.r, b.g, b.b) -
          Math.min(b.r, b.g, b.b) -
          (Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b)),
      )
      .slice(0, 3)
      .map((c) => toHex(c.r, c.g, c.b));

    const ratio = w / h;
    const aspect: MeasuredPhoto["aspect"] = ratio > 1.15 ? "wide" : ratio < 0.87 ? "tall" : "square";
    const light: MeasuredPhoto["light"] =
      brightness > 62 ? "bright and evenly lit" : brightness > 38 ? "soft light" : "low light";

    return {
      ok: true,
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspect,
      brightness: Math.round(brightness),
      contrast: Math.round(contrast),
      saturation: Math.round(saturation),
      colorHexes: ranked,
      light,
    };
  } catch {
    return empty;
  }
}
