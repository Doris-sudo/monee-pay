"use client";

import { useFarcaster } from "./FarcasterProvider";
import styles from "./FarcasterShareButton.module.css";

export default function FarcasterShareButton({
  text = "Check out this escrow transaction on MoneePay — Trustless Commerce on Quai Network!",
  url,
  buttonText = "Share to Farcaster",
}) {
  const { isFrame, sdk } = useFarcaster();

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "https://www.moneepay.xyz");

  const handleShare = () => {
    const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text
    )}&embeds[]=${encodeURIComponent(shareUrl)}`;

    if (isFrame && sdk?.actions?.openUrl) {
      sdk.actions.openUrl(composeUrl);
    } else {
      window.open(composeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button className={styles.shareBtn} onClick={handleShare} type="button">
      <svg
        className={styles.shareIcon}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.24 2.25H5.76A3.51 3.51 0 0 0 2.25 5.76v12.48a3.51 3.51 0 0 0 3.51 3.51h12.48a3.51 3.51 0 0 0 3.51-3.51V5.76a3.51 3.51 0 0 0-3.51-3.51zm-1.8 13.92h-2.19v-4.87c0-.98-.38-1.57-1.28-1.57-.96 0-1.45.65-1.45 1.57v4.87H9.33V9.24h2.19v.91c.42-.64 1.15-1.07 2.19-1.07 1.76 0 2.73 1.13 2.73 3.09v4.02z" />
      </svg>
      {buttonText}
    </button>
  );
}
