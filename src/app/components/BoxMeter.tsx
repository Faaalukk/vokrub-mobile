export default function BoxMeter({ box, size = 6 }: { box: number; size?: number }) {
  return (
    <div className="vk-row" style={{ gap: 4 }} title={`Memory box ${box} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: "50%",
          background: i <= box ? "var(--accent)" : "var(--line)",
          display: "inline-block",
        }} />
      ))}
    </div>
  );
}
