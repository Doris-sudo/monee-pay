"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = "info", txHash = null, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, txHash };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0 && type !== "prompt" && type !== "confirming") {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id, { message, type, txHash, duration = 5000 }) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, type, txHash: txHash || t.txHash } : t))
    );

    if (duration > 0 && type !== "prompt" && type !== "confirming") {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "420px",
        width: "calc(100% - 40px)",
        pointerEvents: "none"
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              background: toast.type === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : toast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : toast.type === "confirming" || toast.type === "broadcast"
                ? "rgba(14, 165, 233, 0.95)"
                : "rgba(15, 23, 42, 0.95)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(12px)",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              animation: "slideIn 0.2s ease-out"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontWeight: 600 }}>
                {toast.type === "prompt" && "✍️ "}
                {toast.type === "broadcast" && "🚀 "}
                {toast.type === "confirming" && "⏳ "}
                {toast.type === "success" && "✓ "}
                {toast.type === "error" && "⚠️ "}
                {toast.message}
              </span>

              {toast.txHash && (
                <a
                  href={`https://orchard.quaiscan.io/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#A7F3D0",
                    fontSize: "0.78rem",
                    textDecoration: "underline",
                    fontFamily: "monospace"
                  }}
                >
                  View on Quaiscan ↗ ({toast.txHash.slice(0, 10)}...)
                </a>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
