"use client";

import { useState } from "react";
import { useFarcaster } from "./FarcasterProvider";
import styles from "./FarcasterShareButton.module.css";

export default function FarcasterAddFrameButton() {
  const { isFrame, sdk } = useFarcaster();
  const [added, setAdded] = useState(false);

  const handleAddFrame = async () => {
    if (sdk?.actions?.addFrame) {
      try {
        const result = await sdk.actions.addFrame();
        if (result?.added) {
          setAdded(true);
        }
      } catch (err) {
        console.error("Failed to add Mini App:", err);
      }
    }
  };

  if (!isFrame) return null;

  return (
    <button
      className={styles.shareBtn}
      onClick={handleAddFrame}
      type="button"
      style={{
        background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
        color: "#0A0E1A",
        fontWeight: "700",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      {added ? "Mini App Added ✓" : "Save as Mini App"}
    </button>
  );
}
