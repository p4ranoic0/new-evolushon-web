import widths from "./asset-widths.json";
export * from "../../shared/index";
export * from "./remote";
const assets = import.meta.glob("../assets/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export function asset(path: string) {
  if (
    path.startsWith("/") ||
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    /^https:\/\//.test(path)
  )
    return path;
  const key = "../assets/" + path.replace(/^.*src\/assets\//, "");
  // Las fotos de src/assets se guardan como "<nombre original>.webp"; el contenido
  // publicado sigue usando la ruta original (p. ej. src/assets/logo.jpg).
  return assets[key] || assets[key + ".webp"] || "";
}
const assetWidths = widths as Record<string, number>;
/**
 * srcset de una imagen de src/assets con sus variantes (scripts/asset-variants.sh).
 * Fotos subidas o externas: undefined (las subidas traen sus propias `variants`).
 */
export function assetSrcSet(path: string): string | undefined {
  if (!path.startsWith("src/assets/")) return undefined;
  const name = path.replace(/^.*src\/assets\//, "");
  const file = name.endsWith(".webp") ? name : name + ".webp";
  const full = assetWidths[file];
  if (!full || !assets["../assets/" + file]) return undefined;
  const stem = file.replace(/\.webp$/, "");
  const list = [120, 400, 700, 1000]
    .map((w) => [assets[`../assets/${stem}.w${w}.webp`], w] as const)
    .filter(([url]) => url)
    .map(([url, w]) => `${url} ${w}w`);
  return list.length ? [...list, `${assets["../assets/" + file]} ${full}w`].join(", ") : undefined;
}
export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
