import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.backgroundGlow} />
      
      <div className={styles.container}>
        <div className={styles.badge}>
          <span className={styles.badgePulse} />
          Built natively on Quai Network
        </div>

        <h1 className={styles.title}>
          Trustless Commerce on <span className="gradient-text">Quai</span>
        </h1>

        <p className={styles.subtitle}>
          Escrow-powered payments that protect both buyers and sellers.
          Funds are locked in smart contracts and released automatically when conditions are satisfied — no intermediaries, no manual delay.
        </p>

        <div className={styles.ctaGroup}>
          <a href="#flow" className="btn btn-primary" id="hero-create-escrow-cta">
            <span>Create Escrow</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <a href="#how-it-works" className="btn btn-outlined" id="hero-how-it-works-cta">
            How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
