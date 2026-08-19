"use client";

import { useState } from "react";
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
    title: "MacBook Pro 16 M4 Max - Damaged Delivery Dispute",
    totalQi: 2400,
    buyer: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47",
    seller: "0x00354572C988dB5ca96827B091a59dAea71Bfbc6",
    reason: "Buyer claims item arrived with cracked screen. Seller claims item was damaged by carrier.",
    createdAt: "Aug 15, 2026",
    status: "disputed",
  },
  {
    id: "task-dispute-002",
    escrowType: "milestone",
    title: "Audit MoneePay Smart Contract - Scope Incomplete",
    totalQi: 1200,
    creator: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
    solver: "0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB",
    reason: "Creator claims solver missed 2 critical vulnerability test cases. Solver claims scope was met.",
    createdAt: "Aug 18, 2026",
    status: "disputed",
  },
];

export default function DisputesAdminPage() {
  const { account, isConnected, connectWallet } = useWallet();
  const { resolveDispute, transferArbitrator, loading } = useEscrowContracts();
  const { addToast } = useToast();

  const [disputes, setDisputes] = useState(MOCK_DISPUTED_ESCROWS);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [splitPercent, setSplitPercent] = useState(50); // 50% split by default
  const [newArbitratorAddr, setNewArbitratorAddr] = useState("");
  const [roleTransferMsg, setRoleTransferMsg] = useState("");

  // Check if connected wallet is designated arbitrator
  const isArbitrator =
    isConnected &&
    (account?.toLowerCase() === CONTRACT_ADDRESSES.Arbitrator.toLowerCase() || true); // Enabled for demo simulation

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
          <div>
            <span className={styles.badgeLabel}>⚖️ Quai Network Arbitration Dashboard</span>
            <h1 className={styles.title}>
              Dispute Resolution & <span className="gradient-text">Arbitration Interface</span>
            </h1>
            <p className={styles.subtitle}>
              Unfreeze disputed smart contract escrows on Quai Cyprus-1. Arbitrators execute <code>resolveDispute()</code> to disburse custom percentage split settlements between buyers and sellers.
            </p>
          </div>
        </div>

        {/* Access Validation Banner */}
        {!isConnected ? (
          <div className={styles.card} style={{ textAlign: "center", padding: "40px 20px" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Connect Arbitrator Wallet</h3>
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginBottom: "20px" }}>
              Please connect your designated arbitrator wallet to resolve active escrow disputes.
            </p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Arbitrator Info Bar */}
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
                  ⚖️ Current Designated Arbitrator (#30)
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00D4AA", fontFamily: "monospace", marginTop: "2px" }}>
                  {CONTRACT_ADDRESSES.Arbitrator}
                </div>
              </div>

              <div className={styles.badgeCount}>
                <span>🟢 Arbitrator Active</span>
              </div>
            </div>

            {/* Active Disputes Section */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 style={{ margin: 0 }}>Active Disputed Escrows</h3>
                <span className={styles.badgeCount}>{disputes.length} Disputes Pending</span>
              </div>

              <div className={styles.grid}>
                {disputes.map((item) => (
                  <div key={item.id} className={styles.disputeItem}>
                    <div className={styles.disputeHeader}>
                      <span className={styles.typeTag}>
                        {item.escrowType === "product" ? "🛍️ Product Escrow" : "🎯 Milestone Escrow"}
                      </span>
                      <span className={styles.disputedBadge}>⚠️ Frozen</span>
                    </div>

                    <h4 className={styles.disputeTitle}>{item.title}</h4>
                    <p className={styles.disputeReason}>&quot;{item.reason}&quot;</p>

                    <div className={styles.metaRow}>
                      <div>
                        <span className={styles.metaLabel}>Escrow Lock</span>
                        <div className={styles.metaVal}>{item.totalQi.toLocaleString()} Qi</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={styles.metaLabel}>Initiated</span>
                        <div className={styles.metaTime}>{item.createdAt}</div>
                      </div>
                    </div>

                    <div style={{ margin: "10px 0" }}>
                      <ExplorerLink hash={CONTRACT_ADDRESSES.ProductEscrow} label="Inspect Contract On-Chain" />
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                      onClick={() => handleOpenResolveModal(item)}
                    >
                      Resolve Dispute & Disburse Split
                    </button>
                  </div>
                ))}

                {disputes.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                    🎉 No active disputes pending arbitration. All escrows settled cleanly!
                  </div>
                )}
              </div>
            </div>

            {/* Role Transfer Section */}
            <div className={styles.card} style={{ marginTop: "24px" }}>
              <h3>👑 Transfer Arbitrator Role</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.88rem", marginBottom: "16px" }}>
                Assign a new arbitrator wallet or DAO multisig address to manage dispute resolutions across MoneePay smart contracts.
              </p>

              <form onSubmit={handleRoleTransfer} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="0x... New Arbitrator Wallet Address"
                  value={newArbitratorAddr}
                  onChange={(e) => setNewArbitratorAddr(e.target.value)}
                  className={styles.numInput}
                  style={{ flex: 1, minWidth: "260px" }}
                  required
                />
                <button type="submit" className="btn btn-outlined" disabled={loading}>
                  Transfer Arbitrator Role
                </button>
              </form>

              {roleTransferMsg && (
                <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "#00D4AA" }}>{roleTransferMsg}</p>
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
              Adjust the percentage split slider below to determine exact Qi disbursement for <strong>{selectedDispute.title}</strong>.
            </p>

            {/* Slider */}
            <div className={styles.sliderBox}>
              <div className={styles.sliderHeader}>
                <span>{labelA}: <strong>{splitPercent}%</strong></span>
                <span>{labelB}: <strong>{100 - splitPercent}%</strong></span>
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

            {/* Live Calculation Preview */}
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
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
              onClick={handleExecuteResolve}
              disabled={loading}
            >
              {loading ? "Signing & Executing Settlement..." : `Execute Split Settlement (${selectedDispute.totalQi.toLocaleString()} Qi)`}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
