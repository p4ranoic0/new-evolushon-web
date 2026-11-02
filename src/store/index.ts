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
export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
