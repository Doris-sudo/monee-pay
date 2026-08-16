"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./CreateOrder.module.css";

export default function CreateOrderPage() {
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

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  // Reset milestones toggle when switching escrow types
  useEffect(() => {
    if (escrowType === "milestone") {
      setEnableMilestones(true);
    } else {
      setEnableMilestones(false);
    }
  }, [escrowType]);

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

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsCreated(true);
      const generatedId = Math.random().toString(36).substring(2, 8);
      const domain =
        typeof window !== "undefined" ? window.location.origin : "https://www.moneepay.xyz";
      setCreatedOrderLink(`${domain}/order/${generatedId}`);
    }, 1500);
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
    setMilestones([
      { id: 1, title: "Discovery & Initial Deliverable", percent: 40 },
      { id: 2, title: "Final Verification & Handover", percent: 60 },
    ]);
  };

  const showMilestones = escrowType === "milestone" || (escrowType === "task_reward" && enableMilestones);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />

      <main className={styles.mainArea}>

      {/* Toast Notification */}
      {toastVisible && (
        <div className={styles.toastWrapper} key={toastKey}>
          <div className={styles.toast}>
            <svg className={styles.toastIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Link copied to clipboard
          </div>
        </div>
      )}

      {/* Main Content */}
        <div className={styles.formCard}>
          {isCreated ? (
            /* ═══════════════════════════════════════════
               POST-CREATION LIVE CARD DISPLAY
               ═══════════════════════════════════════════ */
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
                  : escrowType === "product_sale"
                  ? `Your product listing "${title || "Item"}" priced at ${totalAmount} Qi is live. Share the protected checkout link with buyers.`
                  : `Your milestone escrow of ${totalAmount} Qi is deployed. Funds unlock tranche-by-tranche as milestones are verified.`}
              </p>

              {/* ── Interactive Live Card ── */}
              <div className={styles.liveCard} id="live-task-card">
                <div className={styles.liveCardHeader}>
                  <div className={styles.statusBadge}>
                    <span className={styles.statusDot} />
                    {escrowType === "task_reward"
                      ? "Active Task Reward"
                      : escrowType === "product_sale"
                      ? "Protected Product Listing"
                      : "Active Milestone Escrow"}
                  </div>
                  <span className={styles.escrowBadge}>Escrow Locked</span>
                </div>

                <div className={styles.liveCardBody}>
                  <h3 className={styles.liveCardTitle}>
                    {title || "Untitled Task"}
                  </h3>

                  <div className={styles.liveCardMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Total Lockup</span>
                      <span className={`${styles.metaValue} ${styles.metaValueAccent}`}>
                        {totalAmount} Qi
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Deadline</span>
                      <span className={styles.metaValue}>
                        {deadlineDays} {Number(deadlineDays) === 1 ? "Day" : "Days"} Remaining
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Escrow Type</span>
                      <span className={styles.metaValue}>
                        {escrowType === "task_reward"
                          ? "Task Reward (WQI)"
                          : escrowType === "product_sale"
                          ? "Product Sale (WQI)"
                          : "Milestone (WQI)"}
                      </span>
                    </div>
                  </div>

                  {/* Milestone Breakdown */}
                  {showMilestones && milestones.length > 0 && (
                    <>
                      <hr className={styles.liveCardDivider} />
                      <div className={styles.liveCardMilestones}>
                        <span className={styles.deliverablesLabel}>Milestone Tranches</span>
                        {milestones.map((m, idx) => (
                          <div key={m.id} className={styles.liveMilestoneRow}>
                            <span className={styles.liveMilestoneIndex}>{idx + 1}</span>
                            <span className={styles.liveMilestoneTitle}>{m.title}</span>
                            <span className={styles.liveMilestonePercent}>{m.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Deliverables & Criteria */}
                  {description && (
                    <>
                      <hr className={styles.liveCardDivider} />
                      <div className={styles.liveCardDeliverables}>
                        <span className={styles.deliverablesLabel}>
                          {escrowType === "task_reward"
                            ? "Solver Criteria & Deliverables"
                            : "Description & Requirements"}
                        </span>
                        <p className={styles.deliverablesText}>{description}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Share Box ── */}
              <div className={styles.linkShareBox}>
                <span className={styles.shareUrl}>{createdOrderLink}</span>
                <button className={styles.copyBtn} onClick={handleCopyLink} id="copy-share-link">
                  Copy Share Link
                </button>
              </div>

              {/* ── Action Buttons ── */}
              <div className={styles.actionsRow}>
                <Link
                  href={`/order/${createdOrderLink.split("/").pop()}`}
                  className={`${styles.actionBtn} ${styles.actionPrimary}`}
                  id="view-live-task"
                >
                  View Live {escrowType === "task_reward" ? "Task Reward" : "Listing"}
                </Link>

                <FarcasterShareButton
                  text={
                    escrowType === "task_reward"
                      ? `🎯 New Task Reward: ${title || "Task"} (${totalAmount} Qi reward)! Solve and claim on MoneePay:`
                      : `🛒 Product Listing: ${title || "Item"} (${totalAmount} Qi)! Buy safely on MoneePay:`
                  }
                  url={createdOrderLink}
                  buttonText={
                    escrowType === "task_reward"
                      ? "Share Task to Farcaster"
                      : "Share Listing to Farcaster"
                  }
                />

                <button
                  className={`${styles.actionBtn} ${styles.actionOutlined}`}
                  onClick={handleCreateAnother}
                  id="create-another"
                >
                  Create Another
                </button>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════
               CREATION FORM
               ═══════════════════════════════════════════ */
            <form onSubmit={handleSubmitOrder} id="task-reward-form">
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
                  id="type-task-reward"
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
                  id="type-product-sale"
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
                  id="type-milestone"
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
                {/* Task Title */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="task-title">
                    {escrowType === "task_reward"
                      ? "Task Title"
                      : escrowType === "product_sale"
                      ? "Product Name / Item Title"
                      : "Project Title"}
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    className={styles.textInput}
                    placeholder={
                      escrowType === "task_reward"
                        ? "e.g. Audit Smart Contract or Build React Component"
                        : escrowType === "product_sale"
                        ? "e.g. MacBook Pro 16 M4 Max"
                        : "e.g. Protocol Upgrade Phase 1"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Amount + Deadline Row */}
                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.inputLabel} htmlFor="reward-deposit">
                        {escrowType === "task_reward" ? "Reward Deposit (Qi)" : "Escrow Price (Qi)"}
                      </label>
                      <span className={styles.inputSub}>Wrapped Qi (WQI)</span>
                    </div>
                    <div className={styles.amountPrefixGroup}>
                      <input
                        id="reward-deposit"
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
                    <label className={styles.inputLabel} htmlFor="completion-window">
                      Completion Window
                    </label>
                    <div className={styles.amountPrefixGroup}>
                      <input
                        id="completion-window"
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

                {/* Milestone Tranches Toggle (for task_reward) */}
                {escrowType === "task_reward" && (
                  <div className={styles.inputGroup}>
                    <label
                      className={styles.inputLabel}
                      style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={enableMilestones}
                        onChange={(e) => setEnableMilestones(e.target.checked)}
                        style={{ accentColor: "#00D4AA", width: "16px", height: "16px" }}
                        id="enable-milestones"
                      />
                      Enable Milestone Tranches (Optional)
                    </label>
                  </div>
                )}

                {/* Milestone Builder */}
                {showMilestones && (
                  <div className={styles.milestoneSection} id="milestone-builder">
                    <div className={styles.milestoneHeader}>
                      <label className={styles.inputLabel}>Milestone Tranches</label>
                      <span
                        className={`${styles.milestoneSumBadge} ${
                          totalPercent === 100 ? styles.milestoneSumValid : styles.milestoneSumInvalid
                        }`}
                      >
                        Total: {totalPercent}%
                      </span>
                    </div>

                    {milestones.map((m, idx) => (
                      <div key={m.id} className={styles.milestoneRow}>
                        <span className={styles.milestoneNum}>{idx + 1}</span>

                        <div className={styles.milestoneBody}>
                          <input
                            type="text"
                            className={styles.textInput}
                            value={m.title}
                            onChange={(e) => handleMilestoneTitleChange(m.id, e.target.value)}
                            placeholder="Milestone description..."
                          />
                          <div className={styles.milestoneSliderRow}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={m.percent}
                              onChange={(e) => handleMilestonePercentChange(m.id, e.target.value)}
                              className={styles.trancheSlider}
                              style={{
                                background: `linear-gradient(to right, rgba(0, 212, 170, 0.5) 0%, rgba(0, 212, 170, 0.5) ${m.percent}%, rgba(255, 255, 255, 0.08) ${m.percent}%, rgba(255, 255, 255, 0.08) 100%)`,
                              }}
                            />
                            <span className={styles.tranchePercent}>{m.percent}%</span>
                          </div>
                          <div className={styles.trancheBar}>
                            <div
                              className={styles.trancheBarFill}
                              style={{ width: `${m.percent}%` }}
                            />
                          </div>
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

                    <button
                      type="button"
                      className={styles.addMilestoneBtn}
                      onClick={handleAddMilestone}
                      id="add-milestone"
                    >
                      + Add Milestone Tranche
                    </button>
                  </div>
                )}

                {/* Description / Deliverables */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="deliverables">
                    {escrowType === "task_reward"
                      ? "Deliverables & Instructions"
                      : "Item Description & Delivery Requirements"}
                  </label>
                  <textarea
                    id="deliverables"
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
                  className={styles.deployBtn}
                  id="deploy-task-reward"
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Deploying Escrow Contract...
                    </>
                  ) : escrowType === "task_reward" ? (
                    `Deploy Task Reward (${totalAmount || 0} Qi)`
                  ) : escrowType === "product_sale" ? (
                    `Deploy Product Escrow (${totalAmount || 0} Qi)`
                  ) : (
                    `Deploy Milestone Escrow (${totalAmount || 0} Qi)`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
