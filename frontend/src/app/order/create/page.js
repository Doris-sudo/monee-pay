"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./CreateOrder.module.css";

export default function CreateOrderPage() {
  const router = useRouter();
  // Escrow Types: 'task_reward' | 'product_sale' | 'milestone'
  const [escrowType, setEscrowType] = useState("task_reward");
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("500");
  const [deadlineDays, setDeadlineDays] = useState("7");

  // Milestones State
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Milestone 1: Discovery & Initial Deliverable", percent: 40 },
    { id: 2, title: "Milestone 2: Final Verification & Handover", percent: 60 },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdOrderLink, setCreatedOrderLink] = useState("");

  const handleAddMilestone = () => {
    const nextId = milestones.length + 1;
    setMilestones([
      ...milestones,
      { id: nextId, title: `Milestone ${nextId}: New Task Tranche`, percent: 20 },
    ]);
  };

  const handleRemoveMilestone = (id) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleMilestoneTitleChange = (id, newTitle) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, title: newTitle } : m)));
  };

  const handleMilestonePercentChange = (id, newPercent) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, percent: Number(newPercent) || 0 } : m)));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsCreated(true);
      const generatedId = Math.random().toString(36).substring(2, 8);
      const domain = typeof window !== "undefined" ? window.location.origin : "https://www.moneepay.xyz";
      setCreatedOrderLink(`${domain}/order/${generatedId}`);
    }, 1200);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && createdOrderLink) {
      navigator.clipboard.writeText(createdOrderLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.topHeader}>
        <Link href="/dashboard" className={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        <div className={styles.headerBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Escrow Creation Wizard</span>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainArea}>
        <div className={styles.formCard}>
          {isCreated ? (
            /* SUCCESS STATE & CREATED VIEW CARD */
            <div className={styles.createdSuccess}>
              <div className={styles.createdIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className={styles.createdTitle}>
                {escrowType === "task_reward"
                  ? "🎯 Task Reward Deployed & Live!"
                  : escrowType === "product_sale"
                  ? "🛒 Product Listing Live on Quai Network!"
                  : "🤝 Milestone Escrow Contract Deployed!"}
              </h2>

              <p className={styles.createdSub}>
                {escrowType === "task_reward"
                  ? `Your Task Reward of ${totalAmount} Qi is locked in smart escrow. Solvers can now complete your task and claim rewards upon deliverable approval.`
                  : `Your product listing "${title || "Item"}" priced at ${totalAmount} Qi is live. Share the protected checkout link with buyers.`}
              </p>

              {/* Created Item Preview Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(0, 212, 170, 0.3)",
                  borderRadius: "14px",
                  padding: "20px",
                  margin: "20px 0",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#00D4AA", textTransform: "uppercase" }}>
                    {escrowType === "task_reward" ? "Active Task Reward" : "Protected Product Listing"}
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(0, 212, 170, 0.15)", color: "#00D4AA", padding: "2px 8px", borderRadius: "10px" }}>
                    Escrow Locked
                  </span>
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", margin: "0 0 6px 0" }}>
                  {title || "Untitled Task / Product"}
                </h3>

                <div style={{ display: "flex", gap: "16px", fontSize: "0.88rem", color: "#94a3b8" }}>
                  <span>
                    Total Lockup: <strong style={{ color: "#00D4AA" }}>{totalAmount} Qi</strong>
                  </span>
                  <span>
                    Deadline: <strong>{deadlineDays} Days</strong>
                  </span>
                </div>
              </div>

              {/* Share Box */}
              <div className={styles.linkShareBox}>
                <span className={styles.shareUrl}>{createdOrderLink}</span>
                <button className={styles.copyBtn} onClick={handleCopyLink}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "16px", flexWrap: "wrap" }}>
                <Link href="/order/82hd91" className="btn btn-primary" style={{ flex: 1 }}>
                  View Live {escrowType === "task_reward" ? "Task Reward" : "Listing"}
                </Link>

                <FarcasterShareButton
                  text={
                    escrowType === "task_reward"
                      ? `🎯 New Task Reward: ${title || "Task"} (${totalAmount} Qi reward)! Solve and claim on MoneePay:`
                      : `🛒 Product Listing: ${title || "Item"} (${totalAmount} Qi)! Buy safely on MoneePay:`
                  }
                  url={createdOrderLink}
                  buttonText={escrowType === "task_reward" ? "Share Task to Farcaster" : "Share Listing to Farcaster"}
                />

                <button className="btn btn-outlined" onClick={() => setIsCreated(false)} style={{ flex: 1 }}>
                  Create Another
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmitOrder}>
              <div className={styles.formTitleGroup}>
                <h1 className={styles.formTitle}>Create Smart Contract Escrow</h1>
                <p className={styles.formSub}>
                  Select whether you are creating a Task Reward for solvers or a Protected Product Listing for buyers.
                </p>
              </div>

              {/* Escrow Type Switcher Cards */}
              <div className={styles.typeSwitcher}>
                <div
                  className={`${styles.typeCard} ${escrowType === "task_reward" ? styles.typeActive : ""}`}
                  onClick={() => setEscrowType("task_reward")}
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeName}>🎯 Task Reward Escrow</span>
                    <span className={`${styles.radioDot} ${escrowType === "task_reward" ? styles.radioActive : ""}`} />
                  </div>
                  <p className={styles.typeDesc}>
                    Post a task or project bounty. Funds are locked in escrow upfront and released to the solver upon deliverable approval.
                  </p>
                </div>

                <div
                  className={`${styles.typeCard} ${escrowType === "product_sale" ? styles.typeActive : ""}`}
                  onClick={() => setEscrowType("product_sale")}
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeName}>🛒 Product Sales Escrow</span>
                    <span className={`${styles.radioDot} ${escrowType === "product_sale" ? styles.radioActive : ""}`} />
                  </div>
                  <p className={styles.typeDesc}>
                    Sell a physical or digital product. Funds are held in escrow until the buyer receives and confirms delivery.
                  </p>
                </div>

                <div
                  className={`${styles.typeCard} ${escrowType === "milestone" ? styles.typeActive : ""}`}
                  onClick={() => setEscrowType("milestone")}
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeName}>🤝 Milestone Project</span>
                    <span className={`${styles.radioDot} ${escrowType === "milestone" ? styles.radioActive : ""}`} />
                  </div>
                  <p className={styles.typeDesc}>
                    Multi-stage escrow unlocked tranche-by-tranche as milestones are verified.
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className={styles.formSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {escrowType === "task_reward"
                      ? "Task Reward Title"
                      : escrowType === "product_sale"
                      ? "Product Name / Item Title"
                      : "Project Title"}
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.textInput}
                    placeholder={
                      escrowType === "task_reward"
                        ? "e.g. Audit Smart Contract or Build React UI Component"
                        : escrowType === "product_sale"
                        ? "e.g. MacBook Pro 16 M4 Max"
                        : "e.g. Protocol Upgrade Phase 1"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.inputLabel}>
                        {escrowType === "task_reward" ? "Qi Reward Deposit" : "Escrow Price (Qi)"}
                      </label>
                      <span className={styles.inputSub}>Wrapped Qi (WQI)</span>
                    </div>
                    <div className={styles.amountPrefixGroup}>
                      <input
                        type="number"
                        required
                        min="1"
                        className={styles.amountInput}
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                      />
                      <span className={styles.currencyBadge}>Qi</span>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Delivery / Completion Window</label>
                    <div className={styles.amountPrefixGroup}>
                      <input
                        type="number"
                        required
                        min="1"
                        max="90"
                        className={styles.amountInput}
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(e.target.value)}
                      />
                      <span className={styles.currencyBadge}>Days</span>
                    </div>
                  </div>
                </div>

                {escrowType === "milestone" && (
                  <div className={styles.milestoneSection}>
                    <div className={styles.milestoneHeader}>
                      <label className={styles.inputLabel}>Milestone Tranches</label>
                      <span className={styles.milestoneSumBadge}>
                        Total: {milestones.reduce((acc, curr) => acc + curr.percent, 0)}%
                      </span>
                    </div>

                    {milestones.map((m) => (
                      <div key={m.id} className={styles.milestoneRow}>
                        <span className={styles.milestoneNum}>#{m.id}</span>
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
                          <span style={{ position: "absolute", right: "8px", top: "10px", fontSize: "0.75rem", color: "#64748B" }}>
                            %
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleRemoveMilestone(m.id)}
                          title="Remove milestone"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button type="button" className={styles.addMilestoneBtn} onClick={handleAddMilestone}>
                      + Add Milestone Tranche
                    </button>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {escrowType === "task_reward"
                      ? "Task Instructions & Deliverable Criteria"
                      : "Item Description & Delivery Requirements"}
                  </label>
                  <textarea
                    className={styles.textareaInput}
                    placeholder={
                      escrowType === "task_reward"
                        ? "Specify task instructions, GitHub repository link, or deliverable criteria..."
                        : "Describe item condition, shipping method, and delivery requirements..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className={styles.submitSection}>
                <div className={styles.totalSummaryRow}>
                  <span className={styles.totalLabel}>
                    {escrowType === "task_reward" ? "Total Task Reward Deposit" : "Total Escrow Value"}
                  </span>
                  <span className={styles.totalValue}>{totalAmount || 0} Qi</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "16px", fontSize: "1rem" }}
                >
                  {isSubmitting
                    ? "Deploying Escrow Contract..."
                    : escrowType === "task_reward"
                    ? `Deploy Task Reward (${totalAmount || 0} Qi)`
                    : `Deploy Product Escrow (${totalAmount || 0} Qi)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
