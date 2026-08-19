"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import { useEscrowContracts } from "@/hooks/useEscrowContracts";
import { useWallet } from "@/hooks/useWallet";
import styles from "./CreateOrder.module.css";

export default function CreateOrderPage() {
  const { isConnected, connectWallet } = useWallet();
  const { createTask, createOrder, loading, txHash, error: contractError } = useEscrowContracts();

  // Escrow Types: 'task_reward' | 'product_sale' | 'milestone'
  const [escrowType, setEscrowType] = useState("task_reward");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("500");
  const [deadlineDays, setDeadlineDays] = useState("7");

  // Milestones State (available for task_reward and milestone types)
  const [enableMilestones, setEnableMilestones] = useState(false);
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Discovery & Initial Deliverable", percent: 40 },
    { id: 2, title: "Final Verification & Handover", percent: 60 },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdOrderLink, setCreatedOrderLink] = useState("");
  const [createdTxHash, setCreatedTxHash] = useState("");

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const totalPercent = milestones.reduce((acc, curr) => acc + curr.percent, 0);

  const handleAddMilestone = () => {
    const nextId = milestones.length > 0 ? Math.max(...milestones.map((m) => m.id)) + 1 : 1;
    setMilestones([
      ...milestones,
      { id: nextId, title: `New Task Tranche`, percent: 10 },
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
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, percent: Math.min(100, Math.max(0, Number(newPercent) || 0)) } : m
      )
    );
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    setIsSubmitting(true);

    try {
      let hash = "";

      if (escrowType === "product_sale") {
        // Execute ProductEscrow contract call
        const deadlineSec = Number(deadlineDays) * 86400;
        hash = await createOrder({
          itemTitle: title || "Product Item",
          priceQi: totalAmount,
          deliveryDeadlineSeconds: deadlineSec,
        });
      } else {
        // Execute MilestoneEscrow contract call
        if (showMilestones && totalPercent !== 100) {
          alert(`Tranche percentages must sum to 100%. Current sum: ${totalPercent}%`);
          setIsSubmitting(false);
          return;
        }

        const trancheBps = showMilestones
          ? milestones.map((m) => m.percent * 100)
          : [10000]; // Single 100% payout

        hash = await createTask({
          title: title || "Task Bounty Escrow",
          description: description || "Escrow bounty task",
          rewardQi: totalAmount,
          trancheBpsArray: trancheBps,
        });
      }

      setCreatedTxHash(hash);
      const generatedId = Math.random().toString(36).substring(2, 8);
      const domain = typeof window !== "undefined" ? window.location.origin : "https://www.moneepay.xyz";
      setCreatedOrderLink(`${domain}/order/${generatedId}`);
      setIsSubmitting(false);
      setIsCreated(true);
    } catch (err) {
      console.error("Contract submit error:", err);
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && createdOrderLink) {
      navigator.clipboard.writeText(createdOrderLink);
      setToastKey((k) => k + 1);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2200);
    }
  };

  const handleCreateAnother = () => {
    setIsCreated(false);
    setTitle("");
    setDescription("");
    setTotalAmount("500");
    setDeadlineDays("7");
    setEnableMilestones(false);
    setCreatedTxHash("");
    setMilestones([
      { id: 1, title: "Discovery & Initial Deliverable", percent: 40 },
      { id: 2, title: "Final Verification & Handover", percent: 60 },
    ]);
  };

  const showMilestones = escrowType === "milestone" || (escrowType === "task_reward" && enableMilestones);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        <div className={styles.headerSection}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>
              Create <span className="gradient-text">Escrow Contract</span>
            </h1>
            <p className={styles.subtitle}>
              Deploy trustless smart escrow on Quai Network. Support for milestone payouts, task bounties, and protected physical/digital P2P commerce.
            </p>
          </div>
        </div>

        {contractError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#F87171",
            fontSize: "0.88rem"
          }}>
            ⚠️ Contract Error: {contractError}
          </div>
        )}

        {!isCreated ? (
          <div className={styles.formCard}>
            <form onSubmit={handleSubmitOrder}>
              {/* Type Selector */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Escrow Contract Type</label>
                <div className={styles.typeSelector}>
                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "task_reward" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("task_reward")}
                  >
                    <span className={styles.typeIcon}>⚡</span>
                    <span className={styles.typeTitle}>Task Bounty</span>
                    <span className={styles.typeDesc}>Single or tranche payout upon deliverable completion</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "product_sale" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("product_sale")}
                  >
                    <span className={styles.typeIcon}>🛍️</span>
                    <span className={styles.typeTitle}>Product Commerce</span>
                    <span className={styles.typeDesc}>P2P item sales with delivery deadline protection</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "milestone" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("milestone")}
                  >
                    <span className={styles.typeIcon}>🎯</span>
                    <span className={styles.typeTitle}>Milestone Project</span>
                    <span className={styles.typeDesc}>Multi-phase contract with tranche release approvals</span>
                  </button>
                </div>
              </div>

              {/* Title & Amount */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Contract Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audit Smart Contract or Next.js App Design"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Total Escrow Amount (Qi)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className={styles.input}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Description & Scope of Work</label>
                <textarea
                  rows="4"
                  placeholder="Specify clear deliverables, acceptance criteria, and payout terms..."
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Deadline */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Delivery Deadline (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  className={styles.input}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  style={{ width: "200px" }}
                />
              </div>

              {/* Milestone Tranches */}
              {showMilestones && (
                <div className={styles.milestoneSection}>
                  <div className={styles.milestoneHeader}>
                    <div>
                      <h4 className={styles.milestoneTitle}>Milestone Payout Tranches</h4>
                      <p className={styles.milestoneSub}>Tranche percentages must sum to exactly 100%.</p>
                    </div>
                    <span className={totalPercent === 100 ? styles.percentValid : styles.percentInvalid}>
                      Total: {totalPercent}%
                    </span>
                  </div>

                  {milestones.map((m) => (
                    <div key={m.id} className={styles.milestoneRow}>
                      <input
                        type="text"
                        className={styles.input}
                        value={m.title}
                        onChange={(e) => handleMilestoneTitleChange(m.id, e.target.value)}
                      />
                      <input
                        type="number"
                        className={styles.inputPercent}
                        value={m.percent}
                        onChange={(e) => handleMilestonePercentChange(m.id, e.target.value)}
                      />
                      <span className={styles.percentSymbol}>%</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveMilestone(m.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button type="button" className="btn btn-outlined btn-sm" onClick={handleAddMilestone}>
                    + Add Tranche
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading}
                style={{ width: "100%", padding: "16px", fontSize: "1rem", marginTop: "24px" }}
              >
                {isSubmitting || loading ? "Deploying Smart Contract to Quai Network..." : `Deploy Escrow Contract (${totalAmount} Qi)`}
              </button>
            </form>
          </div>
        ) : (
          /* Success Receipt Card */
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Escrow Contract Deployed! 🎉</h2>
            <p className={styles.successSub}>
              Smart contract deployed on Quai Cyprus-1. Funds locked in WQI escrow until delivery confirmation.
            </p>

            {createdTxHash && (
              <div style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "0.85rem",
                wordBreak: "break-all"
              }}>
                <span style={{ color: "#94A3B8" }}>Transaction Hash: </span>
                <a
                  href={`https://orchard.quaiscan.io/tx/${createdTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#00D4AA", textDecoration: "underline" }}
                >
                  {createdTxHash}
                </a>
              </div>
            )}

            <div className={styles.linkBox}>
              <input type="text" readOnly value={createdOrderLink} className={styles.linkInput} />
              <button className="btn btn-primary" onClick={handleCopyLink}>
                {toastVisible ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <FarcasterShareButton
                text={`Created a trustless escrow payment for ${title} (${totalAmount} Qi) on Quai Network via MoneePay! ⚡`}
                buttonText="Share Escrow Frame to Farcaster"
              />
              <button className="btn btn-outlined" onClick={handleCreateAnother}>
                Create Another Contract
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
