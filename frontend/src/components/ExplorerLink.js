"use client";

export default function ExplorerLink({ type = "tx", hash, label, style = {} }) {
  if (!hash) return null;

  const baseUrl = "https://orchard.quaiscan.io";
  const url = `${baseUrl}/${type}/${hash}`;
  const displayLabel = label || `${hash.slice(0, 8)}...${hash.slice(-6)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#00D4AA",
        textDecoration: "underline",
        fontSize: "0.85rem",
        fontFamily: "monospace",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        ...style,
      }}
      title={`Open ${hash} on Quaiscan Explorer`}
    >
      <span>{displayLabel}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
