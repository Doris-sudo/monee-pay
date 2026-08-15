"use client";

import { useState } from "react";
import styles from "./OrgOnboardingModal.module.css";

export default function OrgOnboardingModal({ isOpen, onClose, onRegister }) {
  const [orgName, setOrgName] = useState("Acme Web3 Corp");
  const [orgDomain, setOrgDomain] = useState("acme.xyz");
  const [treasuryAddr, setTreasuryAddr] = useState("0x7e83...4a2c");
  const [role, setRole] = useState("Payroll Admin");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgName) return;

    if (onRegister) {
      onRegister({
        name: orgName,
        domain: orgDomain,
        treasury: treasuryAddr,
        role: role,
      });
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className={styles.headerIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <h3 className={styles.title}>Register Corporate Organization</h3>
        <p className={styles.sub}>
          Setup your company workspace on MoneePay to disburse team payrolls, manage multi-party stipends, and assign roles.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Company / Organization Name</label>
            <input
              type="text"
              required
              className={styles.input}
              placeholder="e.g. Acme Web3 Corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Corporate Domain / Website</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. acme.xyz"
              value={orgDomain}
              onChange={(e) => setOrgDomain(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Corporate Treasury Wallet (Quai)</label>
            <input
              type="text"
              required
              className={styles.input}
              placeholder="0x... Quai Address"
              value={treasuryAddr}
              onChange={(e) => setTreasuryAddr(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Your Role in Organization</label>
            <select
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ background: "#151c33" }}
            >
              <option value="Payroll Admin">Payroll Admin / Founder</option>
              <option value="Finance Manager">Finance Manager</option>
              <option value="Operations Lead">Operations Lead</option>
            </select>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Create Organization Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
