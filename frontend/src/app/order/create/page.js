"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./CreateOrder.module.css";

export default function CreateOrderPage() {
  const router = useRouter();
  const [escrowType, setEscrowType] = useState("standard"); // 'standard' | 'milestone'
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("500");
  const [deadlineDays, setDeadlineDays] = useState("7");

  // Milestones State
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Milestone 1: Project Discovery & Initial Design", percent: 30 },
    { id: 2, title: "Milestone 2: Prototype & Core Features", percent: 40 },
    { id: 3, title: "Milestone 3: Final Delivery & QA Handover", percent: 30 },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdOrderLink, setCreatedOrderLink] = useState("");

  // Add Milestone Handler
  const handleAddMilestone = () => {
    const nextId = milestones.length + 1;
    setMilestones([
      ...milestones,
      { id: nextId, title: `Milestone ${nextId}: New Deliverable Stage`, percent: 20 }
    ]);
  };

  // Remove Milestone Handler
  const handleRemoveMilestone = (id) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter(m => m.id !== id));
  };

  // Milestone Title Change
  const handleMilestoneTitleChange = (id, newTitle) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  // Milestone Percent Change
  const handleMilestonePercentChange = (id, newPercent) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, percent: Number(newPercent) || 0 } : m));
  };

  // Submit Handler
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedOrderLink(`${window.location.origin}/order/82hd91`);
      setIsCreated(true);
    }, 1200);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(createdOrderLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundGlow} />

      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brandLink}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2"/>
              <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#00D4AA"/>
            </svg>
          </div>
          <span className={styles.brandText}>Monee<span style={{ color: "#00D4AA" }}>Pay</span></span>
        </Link>

        <div className={styles.headerBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Escrow Creation Wizard</span>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainArea}>
        <div className={styles.formCard}>

          {isCreated ? (
            /* SUCCESS STATE */
            <div className={styles.createdSuccess}>
              <div className={styles.createdIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className={styles.createdTitle}>Escrow Contract Deployed!</h2>
              <p className={styles.createdSub}>
                Your smart contract escrow of <strong>{totalAmount} Qi</strong> is live on Quai Network. Share the payment link below with your buyer/seller.
              </p>

              <div className={styles.linkShareBox}>
                <span className={styles.shareUrl}>{createdOrderLink}</span>
                <button className={styles.copyBtn} onClick={handleCopyLink}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px", flexWrap: "wrap" }}>
                <Link href="/order/82hd91" className="btn btn-primary" style={{ flex: 1 }}>
                  View Order Detail
                </Link>
                <FarcasterShareButton text={`New Escrow Order Deployed on MoneePay: ${title || 'Escrow Payment'} (${totalAmount} Qi)!`} url={createdOrderLink} />
                <Link href="/dashboard" className="btn btn-outlined" style={{ flex: 1 }}>
                  Go to Dashboard
                </Link>
              </div>
            </div>

          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmitOrder}>
              <div className={styles.formTitleGroup}>
                <h1 className={styles.formTitle}>Create New Smart Escrow</h1>
                <p className={styles.formSub}>
                  Set up a buyer-protected deposit contract or milestone-gated payment structure on Quai Network.
                </p>
              </div>

              {/* Escrow Type Switcher */}
              <div className={styles.typeSwitcher}>
                <div 
                  className={`${styles.typeCard} ${escrowType === 'standard' ? styles.typeActive : ''}`}
                  onClick={() => setEscrowType("standard")}
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeName}>Standard Product Delivery</span>
                    <span className={`${styles.radioDot} ${escrowType === 'standard' ? styles.radioActive : ''}`} />
                  </div>
                  <p className={styles.typeDesc}>
                    Full amount held in escrow and released upon buyer confirmation of physical or digital item delivery.
                  </p>
                </div>

                <div 
                  className={`${styles.typeCard} ${escrowType === 'milestone' ? styles.typeActive : ''}`}
                  onClick={() => setEscrowType("milestone")}
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeName}>Milestone-Based Escrow</span>
                    <span className={`${styles.radioDot} ${escrowType === 'milestone' ? styles.radioActive : ''}`} />
                  </div>
                  <p className={styles.typeDesc}>
                    Funds are deposited upfront and unlocked step-by-step in discrete tranches as work is completed.
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className={styles.formSection}>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Order / Contract Title</label>
                  <input
                    type="text"
                    required
                    className={styles.textInput}
                    placeholder="e.g. MacBook Pro M4 Purchase or Full Stack App Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.inputLabel}>Total Escrow Value</label>
                      <span className={styles.inputSub}>1:1 Wrapped Qi (WQI)</span>
                    </div>
                    <div className={styles.amountPrefixGroup}>
                      <input
                        type="number"
                        required
                        min="1"
                        className={`${styles.textInput} ${styles.amountInput}`}
                        placeholder="500"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                      />
                      <span className={styles.currencyTag}>Qi</span>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Inspection / Delivery Period</label>
                    <select
                      className={styles.selectInput}
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(e.target.value)}
                    >
                      <option value="3">3 Days after delivery</option>
                      <option value="7">7 Days after delivery (Standard)</option>
                      <option value="14">14 Days after delivery</option>
                      <option value="30">30 Days after delivery</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Counterparty Wallet Address (Optional)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="0x7e83... or leave empty to generate open checkout link"
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                  />
                </div>

                {/* Milestone Builder if Milestone Type */}
                {escrowType === "milestone" && (
                  <div className={styles.milestonesContainer}>
                    <div className={styles.milestoneHeader}>
                      <span className={styles.milestoneTitle}>Milestone Tranche Structure</span>
                      <span className={styles.milestoneCount}>{milestones.length} Milestones</span>
                    </div>

                    {milestones.map((m, idx) => {
                      const calculatedQi = ((Number(totalAmount) || 0) * (m.percent / 100)).toFixed(0);
                      return (
                        <div key={m.id} className={styles.milestoneRow}>
                          <span className={styles.milestoneNum}>#{idx + 1}</span>
                          <input
                            type="text"
                            className={styles.textInput}
                            value={m.title}
                            onChange={(e) => handleMilestoneTitleChange(m.id, e.target.value)}
                          />
                          <div style={{ position: "relative" }}>
                            <input
                              type="number"
                              className={styles.textInput}
                              value={m.percent}
                              onChange={(e) => handleMilestonePercentChange(m.id, e.target.value)}
                            />
                            <span style={{ position: "absolute", right: "8px", top: "10px", fontSize: "0.75rem", color: "#64748B" }}>%</span>
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#00D4AA", textAlign: "right" }}>
                            {calculatedQi} Qi
                          </span>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleRemoveMilestone(m.id)}
                            title="Remove milestone"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      className={styles.addMilestoneBtn}
                      onClick={handleAddMilestone}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <span>Add Milestone Tranche</span>
                    </button>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Contract Scope / Deliverable Details</label>
                  <textarea
                    className={styles.textareaInput}
                    placeholder="Specify delivery requirements, acceptance criteria, or tracking terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

              </div>

              {/* Submit Section */}
              <div className={styles.submitSection}>
                <div className={styles.totalSummaryRow}>
                  <span className={styles.totalLabel}>Total Lockup Deposit</span>
                  <span className={styles.totalValue}>{totalAmount || 0} Qi</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "16px", fontSize: "1rem" }}
                >
                  {isSubmitting ? "Deploying Escrow Contract..." : `Deploy Escrow Contract (${totalAmount || 0} Qi)`}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
