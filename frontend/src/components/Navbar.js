"use client";

import { useState } from "react";
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
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState(null); // { name, domain, treasury, role }

  const handleWalletConnect = async (walletName) => {
    const success = await connectWallet(walletName);
    if (success) {
      router.push("/dashboard?mode=connected");
    }
  };

  const handleToggleWallet = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const handleOrgRegistered = (orgData) => {
    setActiveOrg(orgData);
  };

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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            <button 
              className={isConnected ? "btn btn-outlined" : "btn btn-primary"}
              onClick={handleToggleWallet}
              id="connect-wallet-btn"
              disabled={isConnecting}
            >
              {isConnecting ? (
                "Connecting..."
              ) : isConnected ? (
                <>
                  <span className={styles.statusDot}></span>
                  {truncatedAddress}
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
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
