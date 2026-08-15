"use client";

import { useState, use } from "react";
import Link from "next/link";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./OrderCheckout.module.css";

export default function OrderPage({ params }) {
  const resolvedParams = params ? use(params) : { id: "82hd91" };
  const orderId = resolvedParams.id || "82hd91";

  // View Mode: 'management' | 'checkout'
  const [viewMode, setViewMode] = useState("management");

  // Escrow Status State: 'funded' | 'milestone' | 'disputed' | 'completed'
  const [orderStatus, setOrderStatus] = useState("milestone");

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState("");

  // Milestone Progress State
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Milestone 1: Project Setup & Design", amount: "400 Qi", status: "completed" },
    { id: 2, title: "Milestone 2: Frontend & Escrow Contracts", amount: "400 Qi", status: "active" },
    { id: 3, title: "Milestone 3: Mainnet Audit & Deployment", amount: "400 Qi", status: "pending" },
  ]);

  // Timeline Event Feed State
  const [timeline, setTimeline] = useState([
    { id: 1, title: "Order created & escrow contract deployed", time: "Aug 10, 2026", type: "system" },
    { id: 2, title: "Deposit of 1,200 Qi wrapped & locked in escrow", time: "Aug 10, 2026", type: "deposit" },
    { id: 3, title: "Milestone 1 (400 Qi) approved and released", time: "Aug 12, 2026", type: "release" },
  ]);

  // Buyer Checkout State
  const [payState, setPayState] = useState("connected");
  const [processingStep, setProcessingStep] = useState(1);
  const [walletAddress] = useState("0x7e83...4a2c");
  const [txHash, setTxHash] = useState("");

  // Action: Release Payment
  const handleReleasePayment = () => {
    setOrderStatus("completed");
    setMilestones(milestones.map(m => ({ ...m, status: "completed" })));
    setTimeline([
      ...timeline,
      { id: Date.now(), title: "Full escrow funds (1,200 Qi) released to seller", time: "Just now", type: "release" }
    ]);
    showToast("✓ Escrow funds successfully released to seller!");
  };

  // Action: Approve Current Milestone
  const handleApproveMilestone = () => {
    const activeIdx = milestones.findIndex(m => m.status === "active");
    if (activeIdx !== -1) {
      const updated = [...milestones];
      updated[activeIdx].status = "completed";
      if (activeIdx + 1 < updated.length) {
        updated[activeIdx + 1].status = "active";
      } else {
        setOrderStatus("completed");
      }
      setMilestones(updated);
      setTimeline([
        ...timeline,
        { id: Date.now(), title: `${updated[activeIdx].title} approved (${updated[activeIdx].amount} released)`, time: "Just now", type: "release" }
      ]);
      showToast(`✓ Approved ${updated[activeIdx].title}! Funds released.`);
    }
  };

  // Action: Open Dispute
  const handleOpenDispute = () => {
    setOrderStatus("disputed");
    setTimeline([
      ...timeline,
      { id: Date.now(), title: "Dispute opened by Buyer. Escrow funds frozen.", time: "Just now", type: "dispute" }
    ]);
    showToast("⚠️ Dispute initiated. Funds are frozen until resolution.");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Checkout Execution
  const handleExecuteEscrowPayment = () => {
    setPayState("processing");
    setProcessingStep(1);
    setTimeout(() => setProcessingStep(2), 1200);
    setTimeout(() => setProcessingStep(3), 2400);
    setTimeout(() => {
      setTxHash("0x9a8f...3c12");
      setPayState("success");
    }, 3600);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundGlow} />

      {/* Header */}
      <header className={styles.checkoutHeader}>
        <Link href="/dashboard" className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2"/>
              <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#00D4AA"/>
            </svg>
          </div>
          <span className={styles.brandName}>Monee<span style={{ color: "#00D4AA" }}>Pay</span></span>
        </Link>

        {/* View Mode Switcher */}
        <div className={styles.modeToggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'management' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode("management")}
          >
            Order Detail & Actions
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'checkout' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode("checkout")}
          >
            Buyer Checkout View
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "84px",
          right: "24px",
          zIndex: 100,
          background: "rgba(10, 14, 26, 0.95)",
          border: "1px solid #00D4AA",
          color: "#00D4AA",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          fontWeight: "600",
          fontSize: "0.9rem"
        }}>
          {toastMessage}
        </div>
      )}

      <main className={styles.mainContent}>
        {viewMode === "management" ? (
          /* ================= ORDER MANAGEMENT VIEW ================= */
          <div className={styles.orderLayoutGrid}>
            
            {/* Left Column */}
            <div className={styles.leftCol}>
              
              {/* Order Header Card */}
              <div className={`${styles.orderHeaderCard} glass-card`}>
                <div className={styles.titleStatusRow}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                      Order #{orderId}
                    </span>
                    <h1 className={styles.orderTitle}>Full Stack Escrow App Development</h1>
                  </div>

                  <span className={`${styles.statusBadge} ${styles[orderStatus]}`}>
                    {orderStatus === "funded" ? "Funded & Locked" :
                     orderStatus === "milestone" ? "Milestone 2/3 Active" :
                     orderStatus === "disputed" ? "Disputed / Paused" : "Completed & Settled"}
                  </span>
                </div>

                <div className={styles.orderMetaRow}>
                  <div className={styles.metaItem}>
                    <span>Buyer:</span>
                    <span className={styles.addressBadge}>0x7e83...4a2c</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Seller:</span>
                    <span className={styles.addressBadge}>0x3b91...8f12</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Inspection Deadline:</span>
                    <strong style={{ color: "#fff" }}>Sep 01, 2026</strong>
                  </div>
                </div>
              </div>

              {/* Dispute Alert Banner if Disputed */}
              {orderStatus === "disputed" && (
                <div className={styles.disputeAlertBanner}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div className={styles.disputeText}>
                    <strong>Dispute Active: Escrow Funds Frozen</strong>
                    <br/>
                    A dispute has been initiated for Order #{orderId}. Funds remain locked in smart contract until settled by mutual agreement or arbitration.
                  </div>
                </div>
              )}

              {/* Escrow Actions Bar */}
              <div className={`${styles.actionsCard} glass-card`}>
                <div className={styles.actionsHeader}>
                  <h3 className={styles.actionsTitle}>Escrow Actions</h3>
                  
                  {/* Demo State Switcher */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748B", alignSelf: "center", marginRight: "4px" }}>Demo State:</span>
                    <button className={styles.toggleBtn} onClick={() => setOrderStatus("funded")}>Funded</button>
                    <button className={styles.toggleBtn} onClick={() => setOrderStatus("milestone")}>Milestones</button>
                    <button className={styles.toggleBtn} onClick={() => setOrderStatus("disputed")}>Disputed</button>
                  </div>
                </div>

                <div className={styles.actionGrid}>
                  <button 
                    className={styles.releaseBtn}
                    onClick={handleReleasePayment}
                    disabled={orderStatus === "completed" || orderStatus === "disputed"}
                    style={{ opacity: (orderStatus === "completed" || orderStatus === "disputed") ? 0.5 : 1 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Release All Funds</span>
                  </button>

                  <button 
                    className={styles.approveBtn}
                    onClick={handleApproveMilestone}
                    disabled={orderStatus === "completed" || orderStatus === "disputed"}
                    style={{ opacity: (orderStatus === "completed" || orderStatus === "disputed") ? 0.5 : 1 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>Approve Milestone</span>
                  </button>

                  <button 
                    className={styles.disputeBtn}
                    onClick={handleOpenDispute}
                    disabled={orderStatus === "completed" || orderStatus === "disputed"}
                    style={{ opacity: (orderStatus === "completed" || orderStatus === "disputed") ? 0.5 : 1 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>Open Dispute</span>
                  </button>

                  <FarcasterShareButton buttonText="Share Escrow Link" text={`Check out Escrow Order #${orderId} on MoneePay (Quai Network)!`} />
                </div>
              </div>

              {/* Milestone Progress Component */}
              <div className={`${styles.milestonesCard} glass-card`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className={styles.actionsTitle}>Milestone Breakdown</h3>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#00D4AA" }}>
                    {milestones.filter(m => m.status === "completed").length} of {milestones.length} Completed
                  </span>
                </div>

                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(milestones.filter(m => m.status === "completed").length / milestones.length) * 100}%` 
                    }} 
                  />
                </div>

                <div className={styles.milestoneList}>
                  {milestones.map((m) => (
                    <div 
                      key={m.id} 
                      className={`${styles.milestoneItem} ${m.status === 'active' ? styles.milestoneItemActive : m.status === 'completed' ? styles.milestoneItemDone : ''}`}
                    >
                      <div className={styles.milestoneLeft}>
                        <span className={`${styles.milestoneBadgeDot} ${m.status === 'completed' ? styles.dotDone : m.status === 'active' ? styles.dotActive : styles.dotPending}`}>
                          {m.status === 'completed' ? '✓' : m.id}
                        </span>
                        <div>
                          <div className={styles.milestoneTitle}>{m.title}</div>
                          <span style={{ fontSize: "0.78rem", color: m.status === 'completed' ? '#00D4AA' : m.status === 'active' ? '#00B4D8' : '#64748B' }}>
                            {m.status === 'completed' ? 'Released & Settled' : m.status === 'active' ? 'In Progress / Ready for Approval' : 'Locked in Escrow'}
                          </span>
                        </div>
                      </div>

                      <span className={styles.milestoneAmount}>{m.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Event Timeline */}
              <div className={`${styles.timelineCard} glass-card`}>
                <h3 className={styles.actionsTitle}>Contract Event Timeline</h3>
                <div className={styles.timelineList}>
                  {timeline.map((evt) => (
                    <div key={evt.id} className={styles.timelineItem}>
                      <div className={styles.timelineDot}>●</div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineTitle}>{evt.title}</div>
                        <div className={styles.timelineTime}>{evt.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Financial & Contract Info */}
            <div className={styles.rightCol}>
              <div className={`${styles.infoCard} glass-card`}>
                <h3 className={styles.actionsTitle}>Escrow Summary</h3>
                
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Total Deposit Value</span>
                  <span className={styles.infoVal} style={{ color: "#00D4AA", fontSize: "1.1rem" }}>1,200 Qi</span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Wrapped Asset</span>
                  <span className={styles.infoVal}>1,200 WQI</span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Protocol Markup Fee</span>
                  <span className={styles.infoVal} style={{ color: "#00D4AA" }}>0% (Zero Fee)</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Released to Date</span>
                  <span className={styles.infoVal}>
                    {milestones.filter(m => m.status === "completed").length * 400} Qi
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Remaining Locked</span>
                  <span className={styles.infoVal}>
                    {1200 - (milestones.filter(m => m.status === "completed").length * 400)} Qi
                  </span>
                </div>

                <div className={styles.divider} />

                <div style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: "1.4" }}>
                  🔒 <strong>Smart Contract Protection:</strong>
                  Funds are secured on the Quai Network EVM ledger until explicit buyer approval or dispute settlement.
                </div>
              </div>
            </div>

          </div>

        ) : (
          /* ================= BUYER CHECKOUT VIEW ================= */
          <div className={`${styles.checkoutCard} glass-card`}>
            {payState === "success" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#00D4AA", marginBottom: "8px" }}>Payment Locked in Escrow!</h2>
                <p style={{ color: "#94A3B8", marginBottom: "20px" }}>Your payment of 500 Qi has been secured in smart contract escrow.</p>
                <button className="btn btn-primary" onClick={() => setViewMode("management")} style={{ width: "100%" }}>
                  View Order Management
                </button>
              </div>
            ) : (
              <>
                <div className={styles.productHeader}>
                  <div className={styles.productIconBox}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                    </svg>
                  </div>
                  <div>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>MacBook Pro M4 (16-inch)</h1>
                    <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Seller: Bob's Electronics</span>
                  </div>
                </div>

                <div className={styles.priceBanner}>
                  <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Amount Due</span>
                  <div className={styles.priceValue}>
                    <span className={styles.amount}>500</span>
                    <span className={styles.currency}>Qi</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleExecuteEscrowPayment}
                  style={{ width: "100%", padding: "16px", fontSize: "1rem" }}
                >
                  Pay & Escrow 500 Qi
                </button>
              </>
            )}
          </div>
        )}

        <p className={styles.footerNote}>
          Powered by Quai Network • Protected by Smart Contract Escrow • Order ID: #{orderId}
        </p>
      </main>
    </div>
  );
}
