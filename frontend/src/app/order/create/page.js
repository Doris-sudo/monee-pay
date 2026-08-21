"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import ExplorerLink from "@/components/ExplorerLink";
import { useEscrowContracts, CONTRACT_ADDRESSES } from "@/hooks/useEscrowContracts";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/context/ToastContext";
import styles from "./CreateOrder.module.css";

export default function CreateOrderPage() {
  const { account, isConnected, connectWallet } = useWallet();
  const { createTask, createOrder, loading, error: contractError } = useEscrowContracts();
  const { addToast } = useToast();

  // Escrow Types: 'task_reward' | 'product_sale' | 'milestone'
  const [escrowType, setEscrowType] = useState("task_reward");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("500");
  const [deadlineDays, setDeadlineDays] = useState("7");

  // Milestones State
  const [enableMilestones, setEnableMilestones] = useState(false);
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Phase 1: Initial Architecture & Review", percent: 40 },
    { id: 2, title: "Phase 2: Final Implementation & Sign-off", percent: 60 },
  ]);

  // Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdOrderLink, setCreatedOrderLink] = useState("");
  const [createdTxHash, setCreatedTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  const totalPercent = milestones.reduce((acc, curr) => acc + Number(curr.percent || 0), 0);
  const showMilestones = escrowType === "milestone" || (escrowType === "task_reward" && enableMilestones);
  const isPercentValid = !showMilestones || totalPercent === 100;

  const handleAddMilestone = () => {
    const nextId = milestones.length > 0 ? Math.max(...milestones.map((m) => m.id)) + 1 : 1;
    setMilestones([
      ...milestones,
      { id: nextId, title: `Phase ${nextId}: Deliverable`, percent: 10 },
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

    if (!title.trim()) {
      addToast({ message: "Please enter an escrow contract title.", type: "error" });
      return;
    }

    const priceNum = parseFloat(totalAmount);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast({ message: "Please enter a valid collateral deposit amount in Qi.", type: "error" });
      return;
    }

    if (showMilestones && !isPercentValid) {
      addToast({ message: `Tranche percentages must sum to 100% (Current: ${totalPercent}%).`, type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "Please connect your wallet to deploy contract on-chain.", type: "prompt" });
      connectWallet();
      return;
    }

    setIsSubmitting(true);

    try {
      addToast({ message: "Awaiting wallet signature to deploy escrow contract...", type: "prompt" });
      let hash = "";

      if (escrowType === "product_sale") {
        hash = await createOrder({
          title: title,
          description: description || "Protected P2P product sale listing.",
          priceQi: priceNum,
          deadlineDays: Number(deadlineDays),
        });
      } else {
        const titles = showMilestones
          ? milestones.map((m) => m.title || "Milestone")
          : [title];
        const percents = showMilestones
          ? milestones.map((m) => Number(m.percent))
          : [100];

        hash = await createTask({
          title: title,
          description: description || "Escrow bounty task",
          rewardQi: priceNum,
          milestoneTitles: titles,
          milestonePercents: percents,
        });
      }

      addToast({
        message: "Escrow Smart Contract deployed on Quai Cyprus-1",
        type: "success",
        txHash: hash,
      });

      setCreatedTxHash(hash);
      const generatedId = hash.slice(0, 8);
      const domain = typeof window !== "undefined" ? window.location.origin : "https://www.moneepay.xyz";
      setCreatedOrderLink(`${domain}/order/${generatedId}`);
      setIsSubmitting(false);
      setIsCreated(true);
    } catch (err) {
      console.error("Contract deployment error:", err);
      addToast({ message: `Deployment Failed: ${err.message}`, type: "error" });
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && createdOrderLink) {
      navigator.clipboard.writeText(createdOrderLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      { id: 1, title: "Phase 1: Initial Architecture & Review", percent: 40 },
      { id: 2, title: "Phase 2: Final Implementation & Sign-off", percent: 60 },
    ]);
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header Hero Section */}
        <div className={styles.headerSection}>
          <span className={styles.badgeLabel}>QUAI NETWORK INSTANT SMART ESCROW ENGINE</span>
          <h1 className={styles.title}>
            Deploy On-Chain <span className="gradient-text">Escrow Contract</span>
          </h1>
          <p className={styles.subtitle}>
            Deploy non-custodial smart escrows on Quai Cyprus-1 with automated WQI collateral wrapping. Secure milestone-gated deliverables, P2P commerce, and task bounties with trustless settlement SLAs.
          </p>
        </div>

        {contractError && (
          <div className={styles.errorAlert}>
            Contract Error: {contractError}
          </div>
        )}

        {!isCreated ? (
          <div className={styles.formCard}>
            <form onSubmit={handleSubmitOrder} className={styles.formSection}>
              {/* Type Selector */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Escrow Contract Architecture</label>
                <div className={styles.typeSwitcher}>
                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "task_reward" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("task_reward")}
                  >
                    <div className={styles.typeTopRow}>
                      <span className={styles.typeBadgeTag}>BOUNTY</span>
                      <div className={`${styles.radioDot} ${escrowType === "task_reward" ? styles.radioActive : ""}`} />
                    </div>
                    <span className={styles.typeTitle}>Task & Bounty Escrow</span>
                    <span className={styles.typeDesc}>Single or tranche payout upon deliverable verification</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "product_sale" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("product_sale")}
                  >
                    <div className={styles.typeTopRow}>
                      <span className={styles.typeBadgeTag}>COMMERCE</span>
                      <div className={`${styles.radioDot} ${escrowType === "product_sale" ? styles.radioActive : ""}`} />
                    </div>
                    <span className={styles.typeTitle}>P2P Product Commerce</span>
                    <span className={styles.typeDesc}>Physical or digital item sales with delivery deadline SLA</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.typeCard} ${escrowType === "milestone" ? styles.typeCardActive : ""}`}
                    onClick={() => setEscrowType("milestone")}
                  >
                    <div className={styles.typeTopRow}>
                      <span className={styles.typeBadgeTag}>MILESTONE</span>
                      <div className={`${styles.radioDot} ${escrowType === "milestone" ? styles.radioActive : ""}`} />
                    </div>
                    <span className={styles.typeTitle}>Multi-Phase Milestone Escrow</span>
                    <span className={styles.typeDesc}>Structured milestone releases with individual tranche approvals</span>
                  </button>
                </div>
              </div>

              {/* Title & Amount 2-Column Grid */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Escrow Contract Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solidity Smart Contract Security Audit or Next.js dApp Design"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Escrow Collateral Deposit (Qi) *</label>
                  <div className={styles.currencyWrapper}>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="500"
                      className={styles.input}
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                    />
                    <span className={styles.currencySuffix}>Qi</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Scope of Work & Acceptance Criteria</label>
                <textarea
                  rows={4}
                  placeholder="Specify clear deliverables, acceptance criteria, technical stack, and payout terms..."
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Deadline & Options Row */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Delivery SLA / Expiry Window (Days)</label>
                  <select
                    className={styles.select}
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(e.target.value)}
                  >
                    <option value="3">3 Days (Express SLA)</option>
                    <option value="7">7 Days (Standard SLA)</option>
                    <option value="14">14 Days (Two Weeks SLA)</option>
                    <option value="30">30 Days (Enterprise SLA)</option>
                  </select>
                </div>

                {escrowType === "task_reward" && (
                  <div className={styles.inputGroup} style={{ justifyContent: "center" }}>
                    <label className={styles.label}>Milestone Tranches Option</label>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${enableMilestones ? styles.toggleBtnActive : ""}`}
                      onClick={() => setEnableMilestones(!enableMilestones)}
                    >
                      {enableMilestones ? "Milestone Tranches Enabled" : "+ Enable Milestone Tranches"}
                    </button>
                  </div>
                )}
              </div>

              {/* Milestone Tranches Builder */}
              {showMilestones && (
                <div className={styles.milestoneSection}>
                  <div className={styles.milestoneHeader}>
                    <div>
                      <h4 className={styles.milestoneTitle}>Milestone Payout Tranches</h4>
                      <p className={styles.milestoneSub}>Smart contract requires tranche percentages to sum to exactly 100%.</p>
                    </div>
                    <span className={`${styles.percentBadge} ${isPercentValid ? styles.percentValid : styles.percentInvalid}`}>
                      Total: {totalPercent}% / 100%
                    </span>
                  </div>

                  <div className={styles.milestoneList}>
                    {milestones.map((m, idx) => {
                      const trancheQi = Math.round(((parseFloat(totalAmount) || 0) * (m.percent || 0)) / 100);
                      return (
                        <div key={m.id} className={styles.milestoneRow}>
                          <span className={styles.milestoneNum}>M{idx + 1}</span>
                          <input
                            type="text"
                            placeholder={`Phase ${idx + 1} Title`}
                            className={styles.milestoneInput}
                            value={m.title}
                            onChange={(e) => handleMilestoneTitleChange(m.id, e.target.value)}
                            required
                          />
                          <div className={styles.percentWrapper}>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              className={styles.percentInput}
                              value={m.percent}
                              onChange={(e) => handleMilestonePercentChange(m.id, e.target.value)}
                              required
                            />
                            <span className={styles.percentSymbol}>%</span>
                          </div>
                          <span className={styles.trancheVal}>{trancheQi.toLocaleString()} Qi</span>
                          {milestones.length > 1 && (
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleRemoveMilestone(m.id)}
                              title="Remove Tranche"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className={styles.addMilestoneBtn}
                    onClick={handleAddMilestone}
                  >
                    + Add Milestone Tranche
                  </button>
                </div>
              )}

              {/* On-Chain Contract Verification Box */}
              <div className={styles.contractNotice}>
                <div className={styles.noticeShieldIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.noticeTitle}>
                    Quai Cyprus-1 Contract: {escrowType === "product_sale" ? "ProductEscrow.sol" : "MilestoneEscrow.sol"}
                  </div>
                  <div className={styles.noticeText}>
                    Target Address: <code>{escrowType === "product_sale" ? CONTRACT_ADDRESSES.ProductEscrow : CONTRACT_ADDRESSES.MilestoneEscrow}</code>. Collateral is wrapped to WQI and secured on-chain.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading || (showMilestones && !isPercentValid)}
                style={{ width: "100%", padding: "16px", fontSize: "1rem", marginTop: "12px", justifyContent: "center" }}
              >
                {isSubmitting || loading ? "Deploying Smart Contract to Quai Network..." : `Deploy On-Chain Escrow (${totalAmount} Qi)`}
              </button>
            </form>
          </div>
        ) : (
          /* Success Receipt Card */
          <div className={styles.successCard}>
            <div className={styles.successCheckIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Escrow Contract Deployed</h2>
            <p className={styles.successSub}>
              Smart contract successfully deployed on Quai Cyprus-1. Funds protected in WQI escrow until deliverable verification.
            </p>

            {createdTxHash && (
              <div className={styles.txBox}>
                <ExplorerLink hash={createdTxHash} label="Quaiscan Smart Contract Receipt" />
              </div>
            )}

            <div className={styles.linkBox}>
              <input type="text" readOnly value={createdOrderLink} className={styles.linkInput} />
              <button className="btn btn-primary" onClick={handleCopyLink}>
                {copied ? "Copied Link" : "Copy Share Link"}
              </button>
            </div>

            <div className={styles.successActions}>
              <FarcasterShareButton
                text={`Created a trustless escrow payment for "${title}" (${totalAmount} Qi) on Quai Network via MoneePay!`}
                buttonText="Share Escrow Frame"
              />
              <button className="btn btn-outlined" onClick={handleCreateAnother}>
                Create Another Contract
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
