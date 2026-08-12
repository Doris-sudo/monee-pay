"use client";

import { useState } from "react";
import styles from "./EscrowFlow.module.css";

export default function EscrowFlow() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      stepNum: "01",
      title: "Buyer Deposits Qi",
      badge: "Wrap to WQI",
      description: "Buyer funds the order. Native Qi token is automatically wrapped into WQI for EVM smart contract execution.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    },
    {
      id: 2,
      stepNum: "02",
      title: "Held in Smart Contract",
      badge: "Protected Escrow",
      description: "Funds are securely locked in MoneePay escrow. Neither buyer nor seller can access funds until conditions are met.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
      )
    },
    {
      id: 3,
      stepNum: "03",
      title: "Seller Gets Paid",
      badge: "Unwrap to Qi",
      description: "Buyer approves delivery or milestone. Smart contract releases WQI, unwrapping it directly to seller's native Qi wallet.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    }
  ];

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.sectionTag}>AUTOMATED ESCROW ENGINE</span>
          <h2 className={styles.heading}>How MoneePay Guarantees Safety</h2>
          <p className={styles.subheading}>
            Powered by Quai Network's dual-ledger architecture. Click a stage to explore the flow.
          </p>
        </div>

        <div className={styles.flowGrid} id="flow">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`${styles.flowCard} ${activeStep === step.id ? styles.activeCard : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>{step.icon}</div>
                <span className={styles.stepNumber}>{step.stepNum}</span>
              </div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <span className={styles.badge}>{step.badge}</span>
              <p className={styles.cardDescription}>{step.description}</p>

              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0, 212, 170, 0.4)" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
