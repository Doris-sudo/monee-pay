"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FarcasterAddFrameButton from "./FarcasterAddFrameButton";
import WalletModal from "./WalletModal";
import OrgOnboardingModal from "./OrgOnboardingModal";
import { useWallet } from "@/hooks/useWallet";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const {
    account,
    truncatedAddress,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    balances,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeOrg, setActiveOrg] = useState(null); // { name, domain, treasury, role }

  const menuRef = useRef(null);

  const handleWalletConnect = async (walletName) => {
    const success = await connectWallet(walletName);
    if (success) {
      router.push("/dashboard?mode=connected");
    }
  };

  const handleToggleWallet = () => {
    if (isConnected) {
      setIsWalletMenuOpen((prev) => !prev);
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsWalletMenuOpen(false);
  };

  const handleCopyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrgRegistered = (orgData) => {
    setActiveOrg(orgData);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsWalletMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {isConnected && !isCorrectNetwork && (
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#F87171",
          fontSize: "0.85rem",
          padding: "8px 16px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px"
        }}>
          <span>⚠️ Network Error: Wallet connected to wrong chain. Please switch to Quai Cyprus-1 (Chain ID: 15000).</span>
          <button
            onClick={switchNetwork}
            style={{
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "4px 10px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Switch to Cyprus-1
          </button>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="url(#logo-grad)"/>
                <defs>
                  <linearGradient id="logo-grad" x1="7" y1="6" x2="17" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00D4AA"/>
                    <stop offset="1" stopColor="#00B4D8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <span className={styles.logoText}>Monee<span className={styles.logoHighlight}>Pay</span></span>
            </Link>
          </div>

          <nav className={styles.navLinks}>
            {isConnected ? (
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
            ) : (
              <button
                className={styles.linkGated}
                onClick={() => setIsWalletModalOpen(true)}
                title="Connect wallet to access Dashboard"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Dashboard
              </button>
            )}
            <a href="/marketplace" className={styles.link}>Marketplace</a>
            <a href="/tasks" className={styles.link}>Tasks</a>
            {isConnected && activeOrg && <a href="/payroll" className={styles.link}>Team Payroll</a>}
            <a href="#how-it-works" className={styles.link}>How It Works</a>
            <a href="#features" className={styles.link}>Features</a>
          </nav>

          <div className={styles.actions}>
            {/* Display Qi / WQI Balances when connected */}
            {isConnected && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.78rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "4px 12px",
                color: "#E2E8F0"
              }}>
                <span title="Native Qi Balance">⚡ {balances.qi} Qi</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span title="Wrapped Qi Balance" style={{ color: "#00D4AA" }}>🔒 {balances.wqi} WQI</span>
              </div>
            )}

            {/* Corporate Workspace Switcher — only visible when wallet connected */}
            {isConnected && (
              activeOrg ? (
                <button
                  className="btn btn-outlined btn-sm"
                  onClick={() => setIsOrgModalOpen(true)}
                  style={{
                    borderColor: "rgba(0, 212, 170, 0.4)",
                    color: "#00D4AA",
                    background: "rgba(0, 212, 170, 0.08)",
                    fontSize: "0.82rem",
                  }}
                >
                  🏢 {activeOrg.name}
                </button>
              ) : (
                <button
                  className="btn btn-outlined btn-sm"
                  onClick={() => setIsOrgModalOpen(true)}
                  style={{ fontSize: "0.82rem" }}
                >
                  + Join as Corporate
                </button>
              )
            )}

            <FarcasterAddFrameButton />

            {/* Connected Wallet Dropdown & Disconnect Menu */}
            <div className={styles.walletMenuWrapper} ref={menuRef}>
              <button 
                className={isConnected ? styles.walletBtnConnected : "btn btn-primary"}
                onClick={handleToggleWallet}
                id="connect-wallet-btn"
                disabled={isConnecting && !isConnected}
              >
                {isConnected ? (
                  <>
                    <span className={styles.statusDot}></span>
                    {truncatedAddress}
                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>▾</span>
                  </>
                ) : isConnecting ? (
                  "Connecting..."
                ) : (
                  "Connect Wallet"
                )}
              </button>

              {/* Popover Menu */}
              {isConnected && isWalletMenuOpen && (
                <div className={styles.walletDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownAddress}>{truncatedAddress}</span>
                    <button className={styles.copyBtn} onClick={handleCopyAddress}>
                      {copied ? "✓ Copied" : "📋 Copy"}
                    </button>
                  </div>

                  <div className={styles.networkBadge}>
                    <span className={styles.statusDot}></span>
                    <span>Quai Cyprus-1 (Chain 15000)</span>
                  </div>

                  <div className={styles.balanceSection}>
                    <div className={styles.balanceRow}>
                      <span className={styles.balanceLabel}>Native Qi / QUAI:</span>
                      <span className={styles.balanceVal}>⚡ {balances.qi}</span>
                    </div>
                    <div className={styles.balanceRow}>
                      <span className={styles.balanceLabel}>Wrapped Qi (WQI):</span>
                      <span className={styles.balanceVal} style={{ color: "#00D4AA" }}>🔒 {balances.wqi}</span>
                    </div>
                  </div>

                  <button className={styles.disconnectBtn} onClick={handleDisconnect}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      <OrgOnboardingModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onRegister={handleOrgRegistered}
      />
    </>
  );
}
