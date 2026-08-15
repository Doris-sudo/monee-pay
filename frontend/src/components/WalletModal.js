"use client";

import styles from "./WalletModal.module.css";

export default function WalletModal({ isOpen, onClose, onConnect }) {
  if (!isOpen) return null;

  const handleConnectWallet = (walletName) => {
    if (onConnect) {
      onConnect(walletName);
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className={styles.walletIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 className={styles.title}>Connect Quai Network Wallet</h3>
        <p className={styles.sub}>
          Connecting your wallet is required to sign transactions, create escrow contracts, and execute corporate payroll payouts on MoneePay.
        </p>

        <button className={styles.walletBtn} onClick={() => handleConnectWallet("Pelagus Wallet")}>
          <div className={styles.walletLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
            </svg>
            <span>Pelagus Extension</span>
          </div>
          <span className={styles.badgePopular}>Official Quai</span>
        </button>

        <button className={styles.walletBtn} onClick={() => handleConnectWallet("Farcaster Wallet")}>
          <div className={styles.walletLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A63D2" strokeWidth="2">
              <path d="M18.24 2.25H5.76A3.51 3.51 0 0 0 2.25 5.76v12.48a3.51 3.51 0 0 0 3.51 3.51h12.48a3.51 3.51 0 0 0 3.51-3.51V5.76a3.51 3.51 0 0 0-3.51-3.51z" />
            </svg>
            <span>Farcaster Frame Provider</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#C4B5FD" }}>In-App</span>
        </button>
      </div>
    </div>
  );
}
