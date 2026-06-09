type AvatarProps = { name: string; size?: number };

export default function Avatar({ name, size = 40 }: AvatarProps) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `oklch(0.90 0.045 ${h})`, color: `oklch(0.40 0.07 ${h})`,
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: "-0.02em",
    }}>
      {initials}
    </div>
  );
}
