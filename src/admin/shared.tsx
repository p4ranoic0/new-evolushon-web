import type { InputHTMLAttributes, ReactNode } from "react";
import { LANGS } from "../store";
import type { Lang, SiteData } from "../store";
export type Update = (fn: (d: SiteData) => void) => void;
export function Field({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="field">
      {label}
      <input
        {...props}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function TextField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="field">
      {label}
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
export function LangTabs({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="lang-tabs">
      {LANGS.map((l) => (
        <button
          key={l}
          className={l === lang ? "active" : ""}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"admin-panel " + className}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function TranslateButton({ notify }: { notify: (s: string) => void }) {
  return (
    <button
      className="admin-btn"
      onClick={() =>
        notify(
          "La traducción asistida del prototipo depende de Claude Design y no está disponible en este entorno. Completa las traducciones manualmente.",
        )
      }
    >
      Traducir
    </button>
  );
}
