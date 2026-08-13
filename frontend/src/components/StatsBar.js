import styles from "./StatsBar.module.css";

export default function StatsBar() {
  const stats = [
    { label: "Platform Fee", value: "0%", subtext: "Zero protocol markup" },
    { label: "Total Escrowed", value: "2.4M Qi", subtext: "Secured in contracts" },
    { label: "Completed Orders", value: "1,200+", subtext: "Trustless settlements" },
    { label: "Network Uptime", value: "99.9%", subtext: "Quai PoW consensus" },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.statsCard}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statItem}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
              <span className={styles.subtext}>{stat.subtext}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
