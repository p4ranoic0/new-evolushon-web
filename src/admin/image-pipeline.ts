// Compresión de imágenes en el navegador (patrón de autosell: comprimir → WebP → renombrar).
// HEIC/HEIF se convierte primero con heic2any, cargado solo cuando hace falta.
// Al redibujar en canvas se pierden EXIF y GPS; el servidor solo valida y guarda los WebP.
import imageCompression from "browser-image-compression";
import { api } from "../store/api";
import type { Photo, Settings } from "../store";

const PRESETS = {
  max: { edge: 2000, quality: 0.9 },
  balanced: { edge: 1600, quality: 0.8 },
  light: { edge: 1280, quality: 0.72 },
} as const;
const THUMB = { edge: 640, quality: 0.75 };
const MAX_SOURCE_BYTES = 40 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const HEIC = /\.(heic|heif)$/i;

export function slugify(value: string, max = 48): string {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.[a-z0-9]{2,5}$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
  return slug || "imagen";
}

function stamp(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

/** `{prefijo}-{slug}-{AAAAMMDD}-{6 base36}` — p. ej. `sesiones-clase-grupal-20261101-k3f9qa`. */
export function imageStem(prefix: string, identity: string): string {
  return `${slugify(prefix, 24)}-${slugify(identity)}-${stamp()}-${randomId()}`;
}

async function sizeOf(file: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

async function toDecodable(source: File): Promise<File> {
  const isHeic = /image\/hei[cf]/i.test(source.type) || HEIC.test(source.name);
  if (!isHeic) return source;
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: source, toType: "image/jpeg", quality: 0.92 });
  const blob = Array.isArray(out) ? out[0] : out;
  return new File([blob], source.name.replace(HEIC, ".jpg"), { type: "image/jpeg" });
}

async function toWebp(file: File, edge: number, quality: number, name: string): Promise<File> {
  const blob = await imageCompression(file, {
    maxWidthOrHeight: edge,
    initialQuality: quality,
    fileType: "image/webp",
    useWebWorker: true,
    preserveExif: false,
  });
  return new File([blob], name, { type: "image/webp" });
}

export type PreparedImage = { full: File; thumb: File; originalBytes: number };

/** Comprime y renombra en el navegador: variante `full` según el preset de Ajustes y `thumb` de 640 px. */
export async function prepareImage(
  source: File,
  settings: Settings["img"],
  prefix: string,
  identity: string,
): Promise<PreparedImage> {
  if (!source.type.startsWith("image/") && !HEIC.test(source.name))
    throw new Error("Selecciona una imagen (JPG, PNG, WebP, HEIC…).");
  if (source.size > MAX_SOURCE_BYTES) throw new Error("La imagen original supera los 40 MB.");
  const file = await toDecodable(source);
  const preset = PRESETS[settings.preset] || PRESETS.balanced;
  const stem = imageStem(prefix, identity);

  let full = await toWebp(file, preset.edge, preset.quality, `${stem}.webp`);
  // Si ya era un WebP dentro del tamaño del preset y pesa menos, se conserva el original.
  if (file.type === "image/webp" && file.size < full.size) {
    const { width, height } = await sizeOf(file);
    if (Math.max(width, height) <= preset.edge)
      full = new File([file], `${stem}.webp`, { type: "image/webp" });
  }
  const thumb = await toWebp(file, THUMB.edge, THUMB.quality, `${stem}-thumb.webp`);
  if (full.size > MAX_UPLOAD_BYTES)
    throw new Error("La imagen comprimida supera 5 MB: prueba con el nivel «Ligera» en Ajustes.");
  return { full, thumb, originalBytes: source.size };
}

/** Comprime, renombra y sube. El servidor valida los WebP, lee sus dimensiones y devuelve la foto. */
export async function uploadImage(
  source: File,
  settings: Settings["img"],
  prefix: string,
  identity: string,
): Promise<Photo> {
  const { full, thumb, originalBytes } = await prepareImage(source, settings, prefix, identity);
  const body = new FormData();
  body.append("full", full, full.name);
  body.append("thumb", thumb, thumb.name);
  body.append("originalBytes", String(originalBytes));
  return api.upload<Photo>("/admin/photos", body);
}
