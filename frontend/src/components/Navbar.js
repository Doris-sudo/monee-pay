"use client";

import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState("");

  const toggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setAddress("");
    } else {
      setWalletConnected(true);
      setAddress("0x7e8...4a2c");
    }
  };

  return (
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
          <span className={styles.logoText}>Monee<span className={styles.logoHighlight}>Pay</span></span>
        </div>

        <nav className={styles.navLinks}>
          <a href="#how-it-works" className={styles.link}>How It Works</a>
          <a href="#features" className={styles.link}>Features</a>
          <a href="#teams" className={styles.link}>For Teams</a>
          <a href="#docs" className={styles.link}>Docs</a>
        </nav>

        <div className={styles.actions}>
          <button 
            className={walletConnected ? "btn btn-outlined" : "btn btn-primary"}
            onClick={toggleWallet}
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
  );
}
