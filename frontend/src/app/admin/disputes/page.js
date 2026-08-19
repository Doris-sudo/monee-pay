"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ExplorerLink from "@/components/ExplorerLink";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowContracts, CONTRACT_ADDRESSES } from "@/hooks/useEscrowContracts";
import { useToast } from "@/context/ToastContext";
import styles from "./Disputes.module.css";

const MOCK_DISPUTED_ESCROWS = [
  {
    id: "ord-dispute-001",
    escrowType: "product",
    title: "MacBook Pro 16 M4 Max — Damaged Delivery Dispute",
    totalQi: 2400,
    buyer: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47",
    seller: "0x00354572C988dB5ca96827B091a59dAea71Bfbc6",
    reason: "Buyer claims package arrived with a cracked display. Seller states item left in pristine condition with carrier insurance.",
    createdAt: "Aug 15, 2026",
    status: "disputed",
    orderId: "a3kd82",
    contractAddress: "0x0067f487e59f0C45922854F32B6d8deD8e820776",
  },
  {
    id: "task-dispute-002",
    escrowType: "milestone",
    title: "Audit MoneePay Smart Contract — Scope & Test Cases",
    totalQi: 1200,
    creator: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
    solver: "0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB",
    reason: "Creator claims solver missed 2 critical vulnerability edge-cases. Solver claims deliverables satisfied all written specs.",
    createdAt: "Aug 18, 2026",
    status: "disputed",
    orderId: "k2m9x4",
    contractAddress: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
  },
];

export default function DisputesAdminPage() {
  const { account, isConnected, connectWallet } = useWallet();
  const { resolveDispute, transferArbitrator, loading } = useEscrowContracts();
  const { addToast } = useToast();

  const [disputes, setDisputes] = useState(MOCK_DISPUTED_ESCROWS);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [splitPercent, setSplitPercent] = useState(50); // 50% split by default
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [newArbitratorAddr, setNewArbitratorAddr] = useState("");
  const [roleTransferMsg, setRoleTransferMsg] = useState("");

  // Calculate Metrics
  const totalFrozenQi = useMemo(() => disputes.reduce((sum, d) => sum + d.totalQi, 0), [disputes]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesTab = activeTab === "all" || d.escrowType === activeTab;
      const matchesQuery =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [disputes, activeTab, searchQuery]);

  const handleOpenResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setSplitPercent(50);
  };

  const handleCloseModal = () => {
    setSelectedDispute(null);
  };

  const handleExecuteResolve = async () => {
    if (!selectedDispute) return;

    try {
      addToast({ message: "✍️ Awaiting arbitrator wallet signature...", type: "prompt" });

      const hash = await resolveDispute(selectedDispute.escrowType, selectedDispute.id, splitPercent);

      addToast({
        message: `✓ Dispute settled! Split: ${splitPercent}% / ${100 - splitPercent}%.`,
        type: "success",
        txHash: hash,
      });

      setDisputes(disputes.filter((d) => d.id !== selectedDispute.id));
      setSelectedDispute(null);
    } catch (err) {
      addToast({ message: `⚠️ Settlement Failed: ${err.message}`, type: "error" });
    }
  };

  const handleRoleTransfer = async (e) => {
    e.preventDefault();
    if (!newArbitratorAddr) return;

    try {
      addToast({ message: "✍️ Signing Arbitrator Role Transfer...", type: "prompt" });
      const hash = await transferArbitrator("product", newArbitratorAddr);

      setRoleTransferMsg(`✓ Arbitrator role successfully transferred to ${newArbitratorAddr}. Tx: ${hash}`);
      setNewArbitratorAddr("");
      addToast({ message: "✓ Arbitrator role transferred!", type: "success", txHash: hash });
    } catch (err) {
      setRoleTransferMsg(`⚠️ Transfer Failed: ${err.message}`);
      addToast({ message: `⚠️ Transfer Failed: ${err.message}`, type: "error" });
    }
  };

  const partyA = selectedDispute?.escrowType === "product" ? selectedDispute?.buyer : selectedDispute?.creator;
  const partyB = selectedDispute?.escrowType === "product" ? selectedDispute?.seller : selectedDispute?.solver;
  const labelA = selectedDispute?.escrowType === "product" ? "Buyer Refund" : "Creator Refund";
  const labelB = selectedDispute?.escrowType === "product" ? "Seller Payout" : "Solver Payout";

  const amountA = selectedDispute ? (selectedDispute.totalQi * splitPercent) / 100 : 0;
  const amountB = selectedDispute ? selectedDispute.totalQi - amountA : 0;

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.titleGroup}>
            <span className={styles.badgeLabel}>
              <span>⚖️</span> Quai Network Arbitration Command Center
            </span>
            <h1 className={styles.title}>
              Dispute Resolution & <span className="gradient-text">Arbitration Portal</span>
            </h1>
            <p className={styles.subtitle}>
              Unfreeze and arbitrate disputed smart contract escrows on Quai Cyprus-1. Execute trustless percentage split settlements between counter-parties via <code>resolveDispute()</code>.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Frozen Escrow Volume</span>
            <div className={`${styles.metricVal} ${styles.metricValTeal}`}>{totalFrozenQi.toLocaleString()} Qi</div>
            <span className={styles.metricSub}>Locked in WQI smart contracts</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Active Disputed Escrows</span>
            <div className={styles.metricVal}>{disputes.length} Disputes</div>
            <span className={styles.metricSub}>Awaiting arbitrator decision</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Average Resolution Time</span>
            <div className={styles.metricVal} style={{ color: "#00B4D8" }}>&lt; 4.2 Hours</div>
            <span className={styles.metricSub}>Trustless protocol SLA</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Designated Arbitrator</span>
            <div className={styles.metricVal} style={{ fontSize: "1.1rem", fontFamily: "monospace" }}>
              {CONTRACT_ADDRESSES.Arbitrator.slice(0, 8)}...{CONTRACT_ADDRESSES.Arbitrator.slice(-6)}
            </div>
            <span className={styles.metricSub}>Active Multisig / Role</span>
          </div>
        </div>

        {/* Access Check */}
        {!isConnected ? (
          <div className={styles.govCard} style={{ textAlign: "center", padding: "48px 24px" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Connect Arbitrator Wallet</h3>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 24px auto" }}>
              Connect your authorized Quai wallet to review active disputes, inspect on-chain evidence, and broadcast split settlements.
            </p>
            <button className="btn btn-primary" onClick={connectWallet} style={{ padding: "12px 28px" }}>
              Connect Arbitrator Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.tabGroup}>
                <button
                  className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  All Disputes ({disputes.length})
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "product" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("product")}
                >
                  Product Commerce
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "milestone" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("milestone")}
                >
                  Milestone Escrows
                </button>
              </div>

              <input
                type="text"
                placeholder="Search dispute title or reason..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Disputes Grid */}
            <div className={styles.disputeGrid}>
              {filteredDisputes.map((item) => (
                <div key={item.id} className={styles.disputeCard}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.typeBadge} ${item.escrowType === "product" ? styles.typeProduct : styles.typeMilestone}`}>
                      {item.escrowType === "product" ? "🛍️ Product Escrow" : "🎯 Milestone Escrow"}
                    </span>
                    <span className={styles.disputedBadge}>
                      <span className={styles.pulseDot} />
                      Escrow Frozen
                    </span>
                  </div>

                  <h3 className={styles.disputeTitle}>{item.title}</h3>

                  <div className={styles.reasonBox}>
                    <div style={{ fontSize: "0.75rem", color: "#F87171", fontWeight: "700", textTransform: "uppercase" }}>
                      ⚠️ Disputed Reason & Claim
                    </div>
                    <div className={styles.reasonText}>&quot;{item.reason}&quot;</div>
                  </div>

                  <div className={styles.partiesRow}>
                    <div>
                      <div className={styles.partyLabel}>{item.escrowType === "product" ? "Buyer" : "Creator"}</div>
                      <div className={styles.partyAddr}>{item.buyer ? `${item.buyer.slice(0, 6)}...` : `${item.creator.slice(0, 6)}...`}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={styles.partyLabel}>{item.escrowType === "product" ? "Seller" : "Solver"}</div>
                      <div className={styles.partyAddr}>{item.seller ? `${item.seller.slice(0, 6)}...` : `${item.solver.slice(0, 6)}...`}</div>
                    </div>
                  </div>

                  <div className={styles.metaGrid}>
                    <div>
                      <div className={styles.partyLabel}>Locked Amount</div>
                      <div className={styles.lockVal}>{item.totalQi.toLocaleString()} Qi</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={styles.partyLabel}>Initiated On</div>
                      <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>{item.createdAt}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <ExplorerLink hash={item.contractAddress} label="Quaiscan Smart Contract Evidence" />
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}
                    onClick={() => handleOpenResolveModal(item)}
                  >
                    Arbitrate & Settle Split ({item.totalQi.toLocaleString()} Qi)
                  </button>
                </div>
              ))}
            </div>

            {filteredDisputes.length === 0 && (
              <div className={styles.govCard} style={{ textAlign: "center", padding: "40px" }}>
                <h3>🎉 Zero Pending Disputes</h3>
                <p style={{ color: "#94A3B8" }}>All smart contract escrows have been settled or resolved.</p>
              </div>
            )}

            {/* Arbitrator Governance Panel */}
            <div className={styles.govCard}>
              <div className={styles.govHeader}>
                <div className={styles.govIcon}>👑</div>
                <div>
                  <h3 className={styles.govTitle}>Arbitrator Governance & Multisig Transfer</h3>
                  <div style={{ fontSize: "0.85rem", color: "#00D4AA" }}>Active Arbitrator: {CONTRACT_ADDRESSES.Arbitrator}</div>
                </div>
              </div>

              <p className={styles.govSub}>
                Reassign the arbitrator role across MoneePay smart contracts to a new security council wallet or DAO multisig contract.
              </p>

              <form onSubmit={handleRoleTransfer} className={styles.transferForm}>
                <input
                  type="text"
                  placeholder="0x... New Arbitrator Wallet or Multisig Address"
                  value={newArbitratorAddr}
                  onChange={(e) => setNewArbitratorAddr(e.target.value)}
                  className={styles.transferInput}
                  required
                />
                <button type="submit" className="btn btn-outlined" disabled={loading}>
                  Transfer Role
                </button>
              </form>

              {roleTransferMsg && (
                <div style={{ marginTop: "14px", fontSize: "0.88rem", color: "#00D4AA" }}>{roleTransferMsg}</div>
              )}
            </div>
          </>
        )}
      </main>

      {/* RESOLUTION MODAL (#30) */}
      {selectedDispute && (
        <div className={styles.overlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleCloseModal}>
              ✕
            </button>

            <h3 className={styles.modalTitle}>⚖️ Dispute Split Settlement</h3>
            <p className={styles.modalSub}>
              Set the settlement percentage ratio for <strong>{selectedDispute.title}</strong>. Funds will unfreeze and transfer on-chain immediately upon execution.
            </p>

            {/* Quick Presets */}
            <div className={styles.presetRow}>
              <button
                type="button"
                className={`${styles.presetBtn} ${splitPercent === 100 ? styles.presetBtnActive : ""}`}
                onClick={() => setSplitPercent(100)}
              >
                100% {selectedDispute.escrowType === "product" ? "Buyer" : "Creator"}
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${splitPercent === 75 ? styles.presetBtnActive : ""}`}
                onClick={() => setSplitPercent(75)}
              >
                75% / 25%
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${splitPercent === 50 ? styles.presetBtnActive : ""}`}
                onClick={() => setSplitPercent(50)}
              >
                50% / 50% Split
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${splitPercent === 25 ? styles.presetBtnActive : ""}`}
                onClick={() => setSplitPercent(25)}
              >
                25% / 75%
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${splitPercent === 0 ? styles.presetBtnActive : ""}`}
                onClick={() => setSplitPercent(0)}
              >
                100% {selectedDispute.escrowType === "product" ? "Seller" : "Solver"}
              </button>
            </div>

            {/* Visual Track Bar */}
            <div className={styles.trackBar}>
              <div className={styles.fillA} style={{ width: `${splitPercent}%` }} />
              <div className={styles.fillB} style={{ width: `${100 - splitPercent}%` }} />
            </div>

            {/* Slider */}
            <div className={styles.sliderContainer}>
              <div className={styles.sliderHeader}>
                <span style={{ color: "#60A5FA" }}>{labelA}: {splitPercent}%</span>
                <span style={{ color: "#00D4AA" }}>{labelB}: {100 - splitPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>

            {/* Live Calculation Preview Cards */}
            <div className={styles.calcGrid}>
              <div className={styles.calcCard}>
                <span className={styles.calcLabel}>{labelA}</span>
                <span className={styles.calcAddr}>{partyA?.slice(0, 8)}...</span>
                <div className={styles.calcVal}>{amountA.toLocaleString()} Qi</div>
              </div>

              <div className={styles.calcCard}>
                <span className={styles.calcLabel}>{labelB}</span>
                <span className={styles.calcAddr}>{partyB?.slice(0, 8)}...</span>
                <div className={styles.calcVal} style={{ color: "#00D4AA" }}>{amountB.toLocaleString()} Qi</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "16px", fontSize: "1rem" }}
              onClick={handleExecuteResolve}
              disabled={loading}
            >
              {loading ? "Signing & Executing Settlement..." : `Broadcast Split Settlement (${selectedDispute.totalQi.toLocaleString()} Qi)`}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
