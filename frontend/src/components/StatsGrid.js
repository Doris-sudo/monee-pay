import styles from "./StatsGrid.module.css";

export default function StatsGrid({ viewState = "connected" }) {
  const stats = [
    {
      label: "Active Escrows",
      value: viewState === "empty" ? "0" : "3",
      sub: "Contracts in progress",
      badge: "Live",
    },
    {
      label: "Total Volume",
      value: viewState === "empty" ? "0 Qi" : "12,500 Qi",
      sub: "Lifetime processed",
    },
    {
      label: "Completed",
      value: viewState === "empty" ? "0" : "47",
      sub: "Settled transactions",
    },
    {
      label: "Pending Disputes",
      value: "0",
      sub: "0% dispute rate",
    },
  ];

  return (
    <div className={styles.statsRow}>
      {stats.map((stat, idx) => (
        <div key={idx} className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>{stat.label}</span>
          <div className={styles.statValueGroup}>
            <span className={styles.statValue}>{stat.value}</span>
            {stat.badge && <span className={styles.statBadge}>{stat.badge}</span>}
          </div>
          <span className={styles.statSub}>{stat.sub}</span>
        </div>
      ))}
    </div>
  );
}
