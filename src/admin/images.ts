import { asset } from "../store";
import type { Settings } from "../store";
export const PRESETS = {
  max: { q: 0.9, max: 2000 },
  balanced: { q: 0.82, max: 1600 },
  light: { q: 0.72, max: 1280 },
};
export async function compressImage(src: string, settings: Settings["img"]) {
  const image = new Image();
  image.src = asset(src);
  await image.decode();
  const cfg = PRESETS[settings.preset] || PRESETS.balanced;
  const scale = Math.min(
    1,
    cfg.max / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el lienzo.");
  ctx.fillStyle = "#faf4f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  let out = canvas.toDataURL("image/" + settings.format, cfg.q);
  if (!out.startsWith("data:image/" + settings.format))
    out = canvas.toDataURL("image/jpeg", cfg.q);
  return {
    src: out,
    bytes: Math.round((out.length - out.indexOf(",") - 1) * 0.75),
  };
}
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("No se pudo leer el archivo."));
    r.readAsDataURL(file);
  });
}
export async function processFile(file: File, settings: Settings["img"]) {
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ].includes(file.type)
  )
    throw new Error("Selecciona una imagen JPEG, PNG, WebP, AVIF o GIF.");
  return compressImage(await readFile(file), settings);
}
