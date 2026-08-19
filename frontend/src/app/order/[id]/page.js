"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import { useEscrowContracts } from "@/hooks/useEscrowContracts";
import { useWallet } from "@/hooks/useWallet";
import styles from "./OrderCheckout.module.css";
import "./create.css";

export default function OrderPage({ params }) {
  const resolvedParams = params ? use(params) : { id: "82hd91" };
  const orderId = resolvedParams.id || "82hd91";

  const { isConnected, connectWallet } = useWallet();
  const {
    depositProductEscrow,
    confirmDelivery,
    claimTimeout,
    openProductDispute,
    approveMilestone,
    loading: contractLoading,
    error: contractError,
  } = useEscrowContracts();

  // View Mode: 'management' | 'checkout'
  const [viewMode, setViewMode] = useState("management");

  // Escrow Status State: 'funded' | 'milestone' | 'disputed' | 'completed'
  const [orderStatus, setOrderStatus] = useState("milestone");

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState("");

  // Delivery Deadline Timer State (#26)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(86400 * 3); // 3 days remaining

  // Milestone Progress State (#25)
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Milestone 1: Project Setup & Scope", amount: "400 Qi", status: "completed" },
    { id: 2, title: "Milestone 2: Delivery & Implementation", amount: "400 Qi", status: "active" },
    { id: 3, title: "Milestone 3: Audit & Sign-off", amount: "400 Qi", status: "pending" },
  ]);

  // Timeline Event Feed State
  const [timeline, setTimeline] = useState([
    { id: 1, title: "Order created & escrow contract deployed", time: "Aug 10, 2026", type: "system" },
    { id: 2, title: "Deposit of 1,200 Qi wrapped & locked in ProductEscrow", time: "Aug 10, 2026", type: "deposit" },
    { id: 3, title: "Milestone 1 (400 Qi) approved and released", time: "Aug 12, 2026", type: "release" },
  ]);

  // Buyer Checkout State
  const [payState, setPayState] = useState("connected");
  const [processingStep, setProcessingStep] = useState(1);
  const [txHash, setTxHash] = useState("");

  // Delivery Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // Action: Confirm Delivery & Release Escrow (#26)
  const handleReleasePayment = async () => {
    try {
      if (!isConnected) {
        await connectWallet();
      }
      const hash = await confirmDelivery(orderId);
      setTxHash(hash);
      setOrderStatus("completed");
      setMilestones(milestones.map((m) => ({ ...m, status: "completed" })));
      setTimeline((prev) => [
        ...prev,
        { id: prev.length + 1, title: `Full escrow funds (1,200 Qi) released to seller. Tx: ${hash}`, time: "Just now", type: "release" },
      ]);
      showToast("✓ Delivery confirmed & escrow funds successfully released to seller!");
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    }
  };

  // Action: Approve Current Milestone (#25)
  const handleApproveMilestone = async () => {
    const activeIdx = milestones.findIndex((m) => m.status === "active");
    if (activeIdx !== -1) {
      try {
        if (!isConnected) {
          await connectWallet();
        }
        const hash = await approveMilestone(orderId, activeIdx);
        setTxHash(hash);
        const updated = [...milestones];
        updated[activeIdx].status = "completed";
        if (activeIdx + 1 < updated.length) {
          updated[activeIdx + 1].status = "active";
        } else {
          setOrderStatus("completed");
        }
        const title = updated[activeIdx].title;
        const amount = updated[activeIdx].amount;
        setMilestones(updated);
        setTimeline((prev) => [
          ...prev,
          { id: prev.length + 1, title: `${title} approved (${amount} released). Tx: ${hash}`, time: "Just now", type: "release" },
        ]);
        showToast(`✓ Approved ${title}! Tranche released.`);
      } catch (err) {
        showToast(`⚠️ Error: ${err.message}`);
      }
    }
  };

  // Action: Seller Claim Timeout Payout (#26)
  const handleClaimTimeout = async () => {
    try {
      if (!isConnected) {
        await connectWallet();
      }
      const hash = await claimTimeout(orderId);
      setTxHash(hash);
      setOrderStatus("completed");
      setTimeline((prev) => [
        ...prev,
        { id: prev.length + 1, title: `Seller claimed timeout payout after deadline expiry. Tx: ${hash}`, time: "Just now", type: "release" },
      ]);
      showToast("✓ Delivery deadline expired — seller successfully claimed timeout payout!");
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    }
  };

  // Action: Open Dispute (#25, #26)
  const handleOpenDispute = async () => {
    try {
      if (!isConnected) {
        await connectWallet();
      }
      const hash = await openProductDispute(orderId, "Dispute initiated on order item/milestone");
      setTxHash(hash);
      setOrderStatus("disputed");
      setTimeline((prev) => [
        ...prev,
        { id: prev.length + 1, title: `Dispute opened. Escrow funds frozen on Quai Cyprus-1. Tx: ${hash}`, time: "Just now", type: "dispute" },
      ]);
      showToast("⚠️ Dispute initiated. Funds are frozen until resolution.");
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Checkout Execution (#26)
  const handleExecuteEscrowPayment = async () => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    setPayState("processing");
    setProcessingStep(1);

    try {
      const hash = await depositProductEscrow(orderId, "1200");
      setTxHash(hash);
      setPayState("success");
      setOrderStatus("funded");
      setTimeline((prev) => [
        ...prev,
        { id: prev.length + 1, title: `1,200 Qi deposited into ProductEscrow contract. Tx: ${hash}`, time: "Just now", type: "deposit" },
      ]);
    } catch (err) {
      console.error("Deposit error:", err);
      setPayState("connected");
      showToast(`⚠️ Deposit Failed: ${err.message}`);
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Toast Notification */}
        {toastMessage && <div className={styles.toast}>{toastMessage}</div>}

        {/* Header Bar */}
        <div className={styles.topHeader}>
          <div>
            <span className={styles.orderBadge}>ORDER #{orderId.toUpperCase()}</span>
            <h1 className={styles.orderTitle}>Full-Stack Protocol Audit & Development</h1>
            <p className={styles.orderSub}>
              P2P Protected Commerce & Milestone Escrow on Quai Network
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* View Mode Toggle */}
            <div className={styles.viewToggleGroup}>
              <button
                className={`${styles.toggleBtn} ${viewMode === "management" ? styles.toggleBtnActive : ""}`}
                onClick={() => setViewMode("management")}
              >
                Seller Dashboard
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === "checkout" ? styles.toggleBtnActive : ""}`}
                onClick={() => setViewMode("checkout")}
              >
                Buyer Checkout
              </button>
            </div>

            <FarcasterShareButton
              text={`Managing escrow order #${orderId} (1,200 Qi) on Quai Network via MoneePay! ⚡`}
              buttonText="Share Order Frame"
            />
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

        {/* MODE 1: MANAGEMENT DASHBOARD */}
        {viewMode === "management" && (
          <>
            {/* Delivery Deadline Countdown Card (#26) */}
            <div style={{
              background: "rgba(0, 212, 170, 0.06)",
              border: "1px solid rgba(0, 212, 170, 0.25)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  ⏱️ Product Delivery Deadline Countdown (#26)
                </span>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#00D4AA", fontFamily: "monospace", marginTop: "2px" }}>
                  {formatCountdown(timeLeftSeconds)}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-outlined btn-sm"
                  onClick={handleClaimTimeout}
                  disabled={timeLeftSeconds > 0 || contractLoading}
                  title={timeLeftSeconds > 0 ? "Deadline has not expired yet" : "Claim timeout payout"}
                >
                  Claim Timeout Payout
                </button>
              </div>
            </div>

            {/* Status Overview Banner */}
            <div className={styles.statusBanner}>
              <div className={styles.statusBadgeCol}>
                <span className={styles.labelMuted}>Escrow Lock Status</span>
                <span className={`${styles.statusPill} ${styles["status_" + orderStatus]}`}>
                  {orderStatus === "completed" && "✓ Settled & Released"}
                  {orderStatus === "disputed" && "⚠️ Frozen (In Dispute)"}
                  {orderStatus === "milestone" && "⚡ Active Escrow Lock"}
                  {orderStatus === "funded" && "🔒 Funded in WQI"}
                </span>
              </div>

              <div className={styles.statusMetricCol}>
                <span className={styles.labelMuted}>Total Escrow Lock</span>
                <span className={styles.metricBig}>1,200 Qi</span>
              </div>

              <div className={styles.statusMetricCol}>
                <span className={styles.labelMuted}>Released Payout</span>
                <span className={styles.metricTeal}>400 Qi</span>
              </div>

              <div className={styles.statusActions}>
                {orderStatus !== "completed" && orderStatus !== "disputed" && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={handleReleasePayment} disabled={contractLoading}>
                      Confirm Delivery & Release All (1,200 Qi)
                    </button>
                    <button className="btn btn-outlined btn-sm" onClick={handleOpenDispute} disabled={contractLoading} style={{ borderColor: "#F87171", color: "#F87171" }}>
                      Open Dispute
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Grid Layout */}
            <div className={styles.contentGrid}>
              {/* Left Column: Milestones */}
              <div className={styles.leftCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>Milestone Tranche Releases (#25)</h3>
                    <span className={styles.badgeSm}>3 Tranches</span>
                  </div>

                  <div className={styles.milestoneList}>
                    {milestones.map((m) => (
                      <div key={m.id} className={`${styles.milestoneItem} ${styles["m_" + m.status]}`}>
                        <div className={styles.mInfo}>
                          <span className={styles.mIcon}>
                            {m.status === "completed" ? "✓" : m.status === "active" ? "⚡" : "🔒"}
                          </span>
                          <div>
                            <div className={styles.mTitle}>{m.title}</div>
                            <div className={styles.mAmount}>{m.amount}</div>
                          </div>
                        </div>

                        {m.status === "active" && (
                          <button className="btn btn-outlined btn-sm" onClick={handleApproveMilestone} disabled={contractLoading}>
                            Approve Milestone ({m.amount})
                          </button>
                        )}
                        {m.status === "completed" && (
                          <span style={{ fontSize: "0.78rem", color: "#10B981", fontWeight: 600 }}>Released</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Timeline Event Feed */}
              <div className={styles.rightCol}>
                <div className={styles.card}>
                  <h3>On-Chain Timeline & Receipt</h3>
                  <div className={styles.timelineList}>
                    {timeline.map((item) => (
                      <div key={item.id} className={styles.timelineItem}>
                        <div className={styles.tDot} />
                        <div>
                          <div className={styles.tTitle}>{item.title}</div>
                          <div className={styles.tTime}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODE 2: BUYER CHECKOUT */}
        {viewMode === "checkout" && (
          <div className={styles.checkoutWrapper}>
            <div className={styles.checkoutCard}>
              <h2>Protected Product Commerce Checkout (#26)</h2>
              <p className={styles.orderSub}>Deposit 1,200 Qi into ProductEscrow. Funds are protected until you confirm item delivery.</p>

              <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "16px", borderRadius: "10px", margin: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Item: Full-Stack Protocol Audit</span>
                  <strong>1,200 Qi</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: "0.85rem" }}>
                  <span>Escrow Contract</span>
                  <span>ProductEscrow.sol</span>
                </div>
              </div>

              {payState === "connected" && (
                <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={handleExecuteEscrowPayment} disabled={contractLoading}>
                  {contractLoading ? "Broadcasting to Quai..." : "Deposit 1,200 Qi into Escrow"}
                </button>
              )}

              {payState === "processing" && (
                <div>
                  <p style={{ textAlign: "center", color: "#00D4AA" }}>Processing Quai Cyprus-1 Deposit...</p>
                </div>
              )}

              {payState === "success" && (
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "#10B981" }}>Escrow Deposit Successful! 🎉</h3>
                  {txHash && (
                    <p style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                      Tx Hash: <a href={`https://orchard.quaiscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ color: "#00D4AA" }}>{txHash}</a>
                    </p>
                  )}
                  <button className="btn btn-outlined" onClick={() => setViewMode("management")} style={{ marginTop: "12px" }}>
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
