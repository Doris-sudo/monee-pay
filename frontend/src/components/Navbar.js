"use client";

import { useState } from "react";
import FarcasterAddFrameButton from "./FarcasterAddFrameButton";
import WalletModal from "./WalletModal";
import OrgOnboardingModal from "./OrgOnboardingModal";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState(null); // { name, domain, treasury, role }

  const handleWalletConnect = (walletName) => {
    setWalletConnected(true);
    setAddress("0x7e83...4a2c");
    // Navigate to individual dashboard (not corporate)
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard?mode=connected";
    }
  };

  const handleToggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setAddress("");
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const handleOrgRegistered = (orgData) => {
    setActiveOrg(orgData);
  };

  return (
    <>
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
            <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <span className={styles.logoText}>Monee<span className={styles.logoHighlight}>Pay</span></span>
            </a>
          </div>

          <nav className={styles.navLinks}>
            {walletConnected ? (
              <a href="/dashboard" className={styles.link}>Dashboard</a>
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
            {walletConnected && activeOrg && <a href="/payroll" className={styles.link}>Team Payroll</a>}
            <a href="#how-it-works" className={styles.link}>How It Works</a>
            <a href="#features" className={styles.link}>Features</a>
          </nav>

          <div className={styles.actions}>
            {/* Corporate Workspace Switcher — only visible when wallet connected */}
            {walletConnected && (
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
              className={walletConnected ? "btn btn-outlined" : "btn btn-primary"}
              onClick={handleToggleWallet}
              id="connect-wallet-btn"
            >
              {walletConnected ? (
                <>
                  <span className={styles.statusDot}></span>
                  {address}
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
