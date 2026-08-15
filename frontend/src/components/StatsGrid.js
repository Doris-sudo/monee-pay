import styles from "./StatsGrid.module.css";

export default function StatsGrid({ viewState = "connected" }) {
  const corporateStats = [
    {
      label: "Treasury Balance",
      value: "45,000 Qi",
      sub: "Available on Quai EVM",
      badge: "Treasury",
    },
    {
      label: "Monthly Payroll Allocated",
      value: "1,800 Qi",
      sub: "5 Team Members",
    },
    {
      label: "Contractor Escrows",
      value: "2,450 Qi",
      sub: "3 Active Vendor Contracts",
    },
    {
      label: "YTD Disbursed",
      value: "128,400 Qi",
      sub: "95% Gas Savings",
    },
  ];

  const individualStats = [
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

  const stats = viewState === "corporate" ? corporateStats : individualStats;

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
