"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { quais } from "quais";
import FarcasterAddFrameButton from "./FarcasterAddFrameButton";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, chainId, switchNetwork } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live balances
  const [balances, setBalances] = useState({ qi: "0", wqi: "0" });
  const menuRef = useRef(null);

  // Fetch balances when connected
  useEffect(() => {
    let isMounted = true;
    async function fetchBalances() {
      if (!isConnected || !account || typeof window === "undefined" || !window.pelagus) return;
      try {
        const provider = new quais.BrowserProvider(window.pelagus);
        const qiBalWei = await provider.getBalance(account);
        const qiFormatted = parseFloat(quais.formatEther(qiBalWei)).toFixed(2);

        if (isMounted) {
          setBalances((prev) => ({ ...prev, qi: qiFormatted }));
        }
      } catch (err) {
        console.warn("Failed to fetch native Qi balance:", err);
      }
    }

    fetchBalances();
    const interval = setInterval(fetchBalances, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected, account]);

  // Click outside listener for wallet dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsWalletMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleWallet = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      setIsWalletMenuOpen((prev) => !prev);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsWalletMenuOpen(false);
  };

  const handleCopyAddress = () => {
    if (account && navigator.clipboard) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "";
  const isWrongNetwork = isConnected && chainId && String(chainId) !== "15000" && chainId !== 15000;

  return (
    <>
      {/* Network Warning Banner */}
      {isWrongNetwork && (
        <div style={{
          background: "rgba(239, 68, 68, 0.9)",
          color: "#ffffff",
          fontSize: "0.85rem",
          fontWeight: 700,
          padding: "8px 16px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          position: "relative",
          zIndex: 1001,
        }}>
          <span>Incorrect Network: Switch to Quai Cyprus-1 (Chain 15000).</span>
          <button
            onClick={switchNetwork}
            style={{
              background: "#ffffff",
              color: "#EF4444",
              border: "none",
              borderRadius: "4px",
              padding: "4px 10px",
              fontSize: "0.78rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Switch Network Now
          </button>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo Brand */}
          <Link href="/" className={styles.brand}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2" />
                <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#00D4AA" />
              </svg>
            </div>
            <span className={styles.logoText}>
              Monee<span className={styles.logoHighlight}>Pay</span>
            </span>
            <span className={styles.networkBadgePill}>Quai Cyprus-1</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={styles.navLinks}>
            <Link
              href="/dashboard"
              className={`${styles.link} ${pathname === "/dashboard" ? styles.linkActive : ""}`}
            >
              Dashboard
            </Link>
            <Link
              href="/marketplace"
              className={`${styles.link} ${pathname === "/marketplace" ? styles.linkActive : ""}`}
            >
              Marketplace
            </Link>
            <Link
              href="/tasks"
              className={`${styles.link} ${pathname === "/tasks" ? styles.linkActive : ""}`}
            >
              Tasks & Bounties
            </Link>
            <Link
              href="/payroll"
              className={`${styles.link} ${pathname === "/payroll" ? styles.linkActive : ""}`}
            >
              Corporate Payroll
            </Link>
            <Link
              href="/admin/disputes"
              className={`${styles.link} ${pathname === "/admin/disputes" ? styles.linkActive : ""}`}
            >
              Arbitration
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className={styles.actions}>
            {/* Display Qi / WQI Balances on Desktop */}
            {isConnected && (
              <div className={styles.balanceBadgeDesk}>
                <span title="Native Qi Balance">{balances.qi} Qi</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span title="Wrapped Qi Balance" style={{ color: "#00D4AA" }}>{balances.wqi} WQI</span>
              </div>
            )}

            {/* Farcaster Add Frame Button */}
            <div className={styles.farcasterAddWrapper}>
              <FarcasterAddFrameButton />
            </div>

            {/* Connected Wallet Dropdown */}
            <div className={styles.walletMenuWrapper} ref={menuRef}>
              <button 
                className={isConnected ? styles.walletBtnConnected : "btn btn-primary"}
                onClick={handleToggleWallet}
                id="connect-wallet-btn"
                disabled={isConnecting && !isConnected}
                style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              >
                {isConnected ? (
                  <>
                    <span className={styles.statusDot}></span>
                    <span className={styles.walletAddrText}>{truncatedAddress}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>▾</span>
                  </>
                ) : isConnecting ? (
                  "Connecting..."
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className={styles.connectTextDesk}>Connect Wallet</span>
                  </>
                )}
              </button>

              {/* Popover Menu */}
              {isConnected && isWalletMenuOpen && (
                <div className={styles.walletDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownAddress}>{truncatedAddress}</span>
                    <button className={styles.copyBtn} onClick={handleCopyAddress}>
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className={styles.networkBadge}>
                    <span className={styles.statusDot}></span>
                    <span>Quai Cyprus-1 (Chain 15000)</span>
                  </div>

                  <div className={styles.balanceSection}>
                    <div className={styles.balanceRow}>
                      <span className={styles.balanceLabel}>Native Qi Balance:</span>
                      <span className={styles.balanceVal}>{balances.qi} Qi</span>
                    </div>
                    <div className={styles.balanceRow}>
                      <span className={styles.balanceLabel}>Wrapped Qi (WQI):</span>
                      <span className={styles.balanceVal} style={{ color: "#00D4AA" }}>{balances.wqi} WQI</span>
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

            {/* HAMBURGER TOGGLE BUTTON FOR MOBILE */}
            <button
              className={styles.hamburgerBtn}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className={styles.mobileNavDrawer}>
            {/* Balances summary inside drawer */}
            {isConnected && (
              <div style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(0, 212, 170, 0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem"
              }}>
                <span>Native: <strong>{balances.qi} Qi</strong></span>
                <span style={{ color: "#00D4AA" }}>WQI: <strong>{balances.wqi}</strong></span>
              </div>
            )}

            <div className={styles.mobileNavLinks}>
              <Link href="/dashboard" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/order/create" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Create Escrow Payment
              </Link>
              <Link href="/marketplace" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Escrow Marketplace
              </Link>
              <Link href="/tasks" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Task & Bounty Hub
              </Link>
              <Link href="/payroll" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Corporate Payroll
              </Link>
              <Link href="/admin/disputes" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                Dispute Arbitration
              </Link>
            </div>

            <div className={styles.mobileFooterActions}>
              <FarcasterAddFrameButton />

              {!isConnected ? (
                <button className="btn btn-primary" onClick={connectWallet} style={{ width: "100%" }}>
                  Connect Wallet
                </button>
              ) : (
                <button className={styles.disconnectBtn} onClick={handleDisconnect} style={{ width: "100%" }}>
                  Disconnect ({truncatedAddress})
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
