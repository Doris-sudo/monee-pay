import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brandGroup}>
            <div className={styles.logo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2"/>
                <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#00D4AA"/>
              </svg>
              <span>Monee<span style={{ color: "#00D4AA" }}>Pay</span></span>
            </div>
            <p className={styles.tagline}>
              Trustless escrow platform built on Quai Network.
            </p>
          </div>

          <div className={styles.linksGroup}>
            <div className={styles.col}>
              <h4>Product</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="#teams">For Teams</a>
            </div>
            <div className={styles.col}>
              <h4>Ecosystem</h4>
              <a href="https://qu.ai" target="_blank" rel="noopener noreferrer">Quai Network</a>
              <a href="https://pelagus.io" target="_blank" rel="noopener noreferrer">Pelagus Wallet</a>
              <a href="https://quainance.com" target="_blank" rel="noopener noreferrer">Quainance DEX</a>
            </div>
            <div className={styles.col}>
              <h4>Developers</h4>
              <a href="https://github.com/Doris-sudo/monee-pay" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <a href="#docs">Documentation</a>
              <a href="#contracts">Smart Contracts</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} MoneePay. Released under the MIT License.</p>
          <div className={styles.networkBadge}>
            <span className={styles.greenDot}></span>
            Quai Golden Age Mainnet Ready
          </div>
        </div>
      </div>
    </footer>
  );
}
