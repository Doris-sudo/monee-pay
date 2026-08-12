import styles from "./Features.module.css";

export default function Features() {
  const featureList = [
    {
      id: "payment-links",
      title: "One-Click Payment Links",
      description: "Sellers can generate shareable checkout URLs for any item or service. Buyers open the link and complete checkout with escrow protection.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      )
    },
    {
      id: "milestones",
      title: "Milestone Payouts",
      description: "Break complex freelance or agency projects into discrete milestones. Escrow funds unlock step-by-step as work is reviewed and approved.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      )
    },
    {
      id: "multi-party",
      title: "Multi-Party Splits",
      description: "Automated distribution for marketplaces and agents. Single escrow payments can split instantly between seller, affiliate, and platform.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      )
    },
    {
      id: "teams",
      title: "MoneePay for Teams",
      description: "Condition-free team payouts and stipends in Qi. Batch release recurring payments to global team members with zero hassle.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: "disputes",
      title: "Programmable Dispute Resolution",
      description: "Escrow rules freeze assets safely if delivery fails or dispute arises, protecting both sides until mutually settled or arbitrated.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      id: "quai-native",
      title: "Native Quai Integration",
      description: "Designed specifically for Quai's PoEM consensus and dual-ledger architecture. Lightning fast settlement and negligible network fees.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    }
  ];

  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.sectionTag}>ENTERPRISE FEATURES</span>
          <h2 className={styles.heading}>Built for Every Commerce Workflow</h2>
          <p className={styles.subheading}>
            From peer-to-peer trades to agency milestones and enterprise team stipends.
          </p>
        </div>

        <div className={styles.grid}>
          {featureList.map((feature) => (
            <div key={feature.id} className={styles.card}>
              <div className={styles.iconWrapper}>{feature.icon}</div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
