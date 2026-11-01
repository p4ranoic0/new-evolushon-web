const shapes: Record<string, string> = {
  wave: '<path d="M6 86 C26 86 34 50 58 40 C82 30 104 42 104 60 C104 74 90 80 80 72 C72 66 76 54 86 56"/><path d="M40 70 C50 56 62 50 76 50" stroke-width="2"/><path d="M6 100 C22 94 38 104 54 98 S86 92 100 98 S110 100 114 98"/>',
  waves:
    '<path d="M6 46 q14 -13 28 0 t28 0 t28 0 t26 0"/><path d="M20 64 q14 -13 28 0 t28 0 t28 0"/><path d="M36 82 q14 -13 28 0 t28 0"/>',
  sun: '<circle cx="60" cy="60" r="19"/><path d="M60 24 V12 M60 96 V108 M24 60 H12 M96 60 H108 M34 34 L26 26 M86 86 L94 94 M86 34 L94 26 M34 86 L26 94" /><path d="M52 64 C56 68 64 68 68 64" stroke-width="2"/>',
  palm: '<path d="M58 112 C56 94 58 74 66 50"/><path d="M57 100 l6 -1 M57 88 l7 -1 M60 76 l7 -2 M63 64 l6 -2" stroke-width="2"/><path d="M66 48 C54 36 36 34 18 44 C34 40 50 42 66 48 Z"/><path d="M66 48 C60 30 46 20 30 18 C44 24 56 34 66 48 Z"/><path d="M66 48 C72 30 86 22 102 24 C88 28 76 36 66 48 Z"/><path d="M66 48 C80 42 96 46 108 60 C94 52 80 50 66 48 Z"/><path d="M66 48 C68 32 66 18 58 8 C62 22 64 34 66 48 Z"/><circle cx="63" cy="53" r="3"/><circle cx="70" cy="54" r="3"/><path d="M34 112 C50 107 74 107 94 112"/>',
  board:
    '<path d="M60 6 C84 30 86 82 60 114 C34 82 36 30 60 6 Z"/><path d="M60 16 V104" stroke-width="2"/><path d="M54 98 L60 88 L66 98"/>',
  skate:
    '<path d="M8 48 C12 58 18 62 26 62 L94 62 C102 62 108 58 112 48"/><path d="M14 50 C18 55 21 57 26 57 L94 57 C99 57 102 55 106 50" stroke-width="2"/><path d="M34 62 V72 M86 62 V72"/><path d="M26 72 H42 M78 72 H94"/><circle cx="34" cy="82" r="8"/><circle cx="86" cy="82" r="8"/><path d="M2 76 H14 M4 88 H18" stroke-width="2"/>',
  wheel:
    '<circle cx="60" cy="60" r="24"/><circle cx="60" cy="60" r="9"/><circle cx="60" cy="60" r="2.5"/><path d="M60 36 V30 M84 60 H90 M60 84 V90 M36 60 H30" stroke-width="2"/><path d="M14 98 C30 92 44 92 58 98" stroke-width="2"/>',
  gull: '<path d="M12 60 C24 50 36 48 48 56 C52 58 55 62 58 66 C62 58 70 52 80 50 C90 48 100 52 108 58"/><path d="M62 92 C68 86 74 86 80 92 C86 86 94 86 100 92" stroke-width="2.2"/>',
  fin: '<path d="M24 90 C40 86 54 66 60 30 C62 28 66 28 67 32 C70 60 82 80 98 90"/><path d="M6 98 q14 -9 28 0 t28 0 t28 0 t26 0"/>',
  star: '<path d="M60 14 C63 30 66 40 72 46 C80 48 92 48 104 50 C94 58 84 64 80 70 C80 80 84 92 88 104 C78 96 68 88 60 86 C52 88 42 96 32 104 C36 92 40 80 40 70 C36 64 26 58 16 50 C28 48 40 48 48 46 C54 40 57 30 60 14 Z"/><circle cx="60" cy="58" r="2.5"/><circle cx="74" cy="56" r="2"/><circle cx="46" cy="56" r="2"/><circle cx="68" cy="72" r="2"/><circle cx="52" cy="72" r="2"/>',
  swirl:
    '<path d="M60 60 m0 -5 a5 5 0 1 1 -5 5 a11 11 0 1 1 11 11 a19 19 0 1 1 -19 -19 a29 29 0 1 1 29 29"/>',
  shades:
    '<path d="M22 56 H54 C54 72 48 80 38 80 C28 80 22 72 22 56 Z"/><path d="M66 56 H98 C98 72 92 80 82 80 C72 80 66 72 66 56 Z"/><path d="M54 58 Q60 52 66 58 M22 56 L10 48 M98 56 L110 48"/>',
  splash:
    '<circle cx="30" cy="40" r="4"/><circle cx="48" cy="24" r="6"/><circle cx="70" cy="34" r="3.5"/><circle cx="88" cy="22" r="5"/><path d="M8 94 C28 70 48 70 60 88 C72 70 92 70 112 94"/><path d="M30 104 H90" stroke-width="2"/>',
  tent: '<path d="M14 100 L60 24 L106 100 Z"/><path d="M48 100 L60 72 L72 100"/><path d="M60 24 V12 L72 16 L60 20" stroke-width="2"/><path d="M4 100 H116"/>',
  mountains:
    '<path d="M6 100 L40 44 L58 72 L76 36 L114 100 Z"/><path d="M32 57 L40 50 L48 58 M68 50 L76 44 L84 52" stroke-width="2"/><circle cx="96" cy="26" r="8"/>',
  shell:
    '<path d="M60 102 L18 52 C26 24 94 24 102 52 Z"/><path d="M60 102 L36 32 M60 102 L60 28 M60 102 L84 32 M60 102 L24 44 M60 102 L96 44" stroke-width="2"/><path d="M50 102 H70 L66 110 H54 Z"/>',
  flower:
    '<path transform="rotate(0 60 60)" d="M60 60 C46 46 46 22 60 16 C74 22 74 46 60 60 Z"/><path transform="rotate(72 60 60)" d="M60 60 C46 46 46 22 60 16 C74 22 74 46 60 60 Z"/><path transform="rotate(144 60 60)" d="M60 60 C46 46 46 22 60 16 C74 22 74 46 60 60 Z"/><path transform="rotate(216 60 60)" d="M60 60 C46 46 46 22 60 16 C74 22 74 46 60 60 Z"/><path transform="rotate(288 60 60)" d="M60 60 C46 46 46 22 60 16 C74 22 74 46 60 60 Z"/><path d="M60 60 L82 38" stroke-width="2"/><circle cx="84" cy="36" r="2.5"/><circle cx="78" cy="34" r="2"/><circle cx="86" cy="42" r="2"/>',
  cloud:
    '<path d="M22 82 C8 82 8 62 24 62 C24 46 46 42 52 54 C58 38 84 40 84 58 C100 56 106 82 90 82 Z"/>',
};
export function Doodle({
  name = "wave",
  className = "",
}: {
  name?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={"doodle " + className}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: shapes[name] || shapes.wave }}
    />
  );
}
