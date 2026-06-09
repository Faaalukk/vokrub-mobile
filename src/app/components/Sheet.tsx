"use client";

import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "color-mix(in oklch, var(--ink) 32%, transparent)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "vk-pop .18s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="vk-scroll"
        style={{
          background: "var(--surface)", width: "100%",
          maxHeight: "92%", overflow: "auto",
          borderRadius: "var(--r-card) var(--r-card) 0 0",
          boxShadow: "var(--sh-3)", animation: "vk-rise .3s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 999, background: "var(--line)", margin: "10px auto 0" }} />
        {title && (
          <div className="vk-between" style={{ padding: "16px 20px 4px" }}>
            <span className="vk-h2">{title}</span>
            <button onClick={onClose} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 34, height: 34, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)" }}>
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
