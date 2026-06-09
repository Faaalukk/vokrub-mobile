type SectionHeadProps = { title: string; action?: string; onAction?: () => void };

export default function SectionHead({ title, action, onAction }: SectionHeadProps) {
  return (
    <div className="vk-between" style={{ marginBottom: 12 }}>
      <span className="vk-h2">{title}</span>
      {action && (
        <span onClick={onAction} className="vk-accent vk-sm" style={{ cursor: "pointer", fontWeight: 700 }}>
          {action}
        </span>
      )}
    </div>
  );
}
