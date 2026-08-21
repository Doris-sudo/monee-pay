"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ExplorerLink from "@/components/ExplorerLink";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowContracts, CONTRACT_ADDRESSES } from "@/hooks/useEscrowContracts";
import { useToast } from "@/context/ToastContext";
import styles from "./Disputes.module.css";

const MOCK_DISPUTES = [
  {
    id: "disp-001",
    orderId: "a3kd82",
    escrowType: "product",
    contractAddress: CONTRACT_ADDRESSES.ProductEscrow,
    buyer: "0x001c...3f47",
    seller: "0x0035...fbc6",
    amountQi: 2400,
    disputeReason: "Buyer claims item was not delivered within 3-day SLA. Seller uploaded shipping tracking receipt.",
    status: "Pending Arbitrator Review",
    createdAt: "Aug 19, 2026",
    txHash: "0x0067f487e59f0C45922854F32B6d8deD8e820776",
  },
  {
    id: "disp-002",
    orderId: "k2m9x4",
    escrowType: "milestone",
    contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
    buyer: "0x000E...8fbA",
    seller: "0x0071...9a12",
    amountQi: 1200,
    disputeReason: "Milestone 2 deliverable rejected due to missing audit unit test coverage.",
    status: "Under Arbitration",
    createdAt: "Aug 17, 2026",
    txHash: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
  },
];

export default function DisputesAdminPage() {
  const { account, isConnected, connectWallet } = useWallet();
  const { resolveDispute, transferArbitrator, loading } = useEscrowContracts();
  const { addToast } = useToast();

  const [disputesList, setDisputesList] = useState(MOCK_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [splitPercent, setSplitPercent] = useState(50); // % to Buyer, remainder to Seller
  const [newArbitratorAddr, setNewArbitratorAddr] = useState("");
  const [roleTransferMsg, setRoleTransferMsg] = useState("");

  const designatedArbitrator = CONTRACT_ADDRESSES.Arbitrator;
  const isArbitratorAuthorized = isConnected && account && account.toLowerCase() === designatedArbitrator.toLowerCase();

  const handleResolveDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!isConnected) {
      addToast({ message: "Please connect authorized arbitrator wallet to execute settlement.", type: "prompt" });
      connectWallet();
      return;
    }

    if (!isArbitratorAuthorized) {
      addToast({
        message: `Unauthorized: Connected wallet (${account.slice(0, 6)}...${account.slice(-4)}) is not the designated Arbitrator (${designatedArbitrator.slice(0, 6)}...${designatedArbitrator.slice(-4)}).`,
        type: "error",
      });
      return;
    }

    try {
      addToast({ message: "Awaiting arbitrator wallet signature...", type: "prompt" });

      const hash = await resolveDispute(selectedDispute.escrowType, selectedDispute.orderId, splitPercent);

      addToast({
        message: `Dispute settled! Split: ${splitPercent}% to Buyer / ${100 - splitPercent}% to Seller.`,
        type: "success",
        txHash: hash,
      });

      setDisputesList((prev) => prev.filter((d) => d.id !== selectedDispute.id));
      setSelectedDispute(null);
    } catch (err) {
      addToast({ message: `Settlement Failed: ${err.message}`, type: "error" });
    }
  };

  const handleTransferRole = async (e) => {
    e.preventDefault();
    if (!newArbitratorAddr.trim()) return;

    if (!isConnected) {
      addToast({ message: "Please connect authorized arbitrator wallet.", type: "prompt" });
      connectWallet();
      return;
    }

    if (!isArbitratorAuthorized) {
      addToast({
        message: `Unauthorized: Only designated Arbitrator (${designatedArbitrator.slice(0, 6)}...${designatedArbitrator.slice(-4)}) can transfer arbitration governance.`,
        type: "error",
      });
      return;
    }

    try {
      addToast({ message: "Signing Arbitrator Role Transfer...", type: "prompt" });

      const hash = await transferArbitrator("product", newArbitratorAddr.trim());
      setRoleTransferMsg(`Arbitrator role successfully transferred to ${newArbitratorAddr}. Tx: ${hash}`);
      addToast({ message: "Arbitrator role transferred!", type: "success", txHash: hash });
      setNewArbitratorAddr("");
    } catch (err) {
      setRoleTransferMsg(`Transfer Failed: ${err.message}`);
      addToast({ message: `Transfer Failed: ${err.message}`, type: "error" });
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span className={styles.badgeLabel}>Arbitration Command Center</span>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                background: isArbitratorAuthorized ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                border: isArbitratorAuthorized ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                color: isArbitratorAuthorized ? "#10B981" : "#F59E0B",
              }}>
                {isArbitratorAuthorized ? "Authorized Arbitrator" : isConnected ? "Unauthorized Observer Wallet" : "Wallet Disconnected"}
              </span>
            </div>

            <h1 className={styles.title}>
              Dispute <span className="gradient-text">Arbitration Panel</span>
            </h1>
            <p className={styles.subtitle}>
              Review flagged escrow disputes, inspect on-chain receipts, and execute split settlements on Quai Cyprus-1 smart contracts.
            </p>
          </div>
        </div>

        {/* Authorization Alert Banner if Not Authorized */}
        {isConnected && !isArbitratorAuthorized && (
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "24px",
            color: "#FBBF24",
            fontSize: "0.88rem",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <strong>Role Authorization Guard Notice</strong>
            <span>
              Connected Wallet: <code>{account}</code>. Designated Arbitrator Contract Owner: <code>{designatedArbitrator}</code>.
            </span>
            <span style={{ color: "#94A3B8", fontSize: "0.82rem" }}>
              You are currently viewing in read-only mode. On-chain settlement transactions require signatures from the designated arbitrator multisig wallet.
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{disputesList.length}</div>
            <div className={styles.statLabel}>Pending Disputes</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>50 / 50</div>
            <div className={styles.statLabel}>Default Settlement Split</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>Quai Cyprus-1</div>
            <div className={styles.statLabel}>Arbitration Protocol</div>
          </div>
        </div>

        {/* Disputes Grid */}
        <div className={styles.disputesGrid}>
          {disputesList.map((item) => (
            <div key={item.id} className={styles.disputeCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.orderBadge}>Order #{item.orderId}</span>
                  <h3 className={styles.cardTitle}>
                    Dispute #{item.id}
                  </h3>
                </div>
                <span className={styles.statusBadge}>{item.status}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <div className={styles.metaCol}>
                    <span className={styles.metaLabel}>Buyer Address</span>
                    <code className={styles.metaVal}>{item.buyer}</code>
                  </div>
                  <div className={styles.metaCol}>
                    <span className={styles.metaLabel}>Seller Address</span>
                    <code className={styles.metaVal}>{item.seller}</code>
                  </div>
                  <div className={styles.metaCol}>
                    <span className={styles.metaLabel}>Escrow Amount</span>
                    <strong style={{ color: "#00D4AA" }}>{item.amountQi.toLocaleString()} Qi</strong>
                  </div>
                </div>

                <div className={styles.contractTypeRow}>
                  <span className={styles.typeLabel}>Escrow Protocol:</span>
                  <span className={styles.typeVal}>
                    {item.escrowType === "product" ? "Product Escrow" : "Milestone Escrow"}
                  </span>
                </div>

                {item.txHash && (
                  <div style={{ margin: "12px 0" }}>
                    <ExplorerLink hash={item.txHash} label="Inspect On-Chain Evidence Receipt" />
                  </div>
                )}

                <div className={styles.reasonBox}>
                  <div className={styles.reasonHeader}>
                    Disputed Reason & Claim
                  </div>
                  <p className={styles.reasonText}>{item.disputeReason}</p>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "16px", justifyContent: "center" }}
                  onClick={() => setSelectedDispute(item)}
                >
                  Execute Split Settlement
                </button>
              </div>
            </div>
          ))}

          {disputesList.length === 0 && (
            <div className={styles.emptyState}>
              <h3>Zero Pending Disputes</h3>
              <p>All on-chain escrow contracts are running smoothly without active disputes.</p>
            </div>
          )}
        </div>

        {/* Transfer Arbitrator Role Admin Panel */}
        <div className={styles.adminPanel}>
          <h3 className={styles.panelTitle}>Arbitrator Security Admin</h3>
          <p className={styles.panelSub}>Transfer multisig or single arbitrator governance authority for MilestoneEscrow.sol & ProductEscrow.sol.</p>

          <form onSubmit={handleTransferRole} className={styles.transferForm}>
            <input
              type="text"
              placeholder="0x00... New Arbitrator Address"
              className={styles.transferInput}
              value={newArbitratorAddr}
              onChange={(e) => setNewArbitratorAddr(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-outlined" disabled={loading}>
              Transfer Role
            </button>
          </form>
          {roleTransferMsg && <div className={styles.msgAlert}>{roleTransferMsg}</div>}
        </div>
      </main>

      {/* Settlement Pop-Up Modal */}
      {selectedDispute && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDispute(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedDispute(null)}>
              ✕
            </button>

            <h3 className={styles.modalTitle}>Dispute Split Settlement</h3>
            <p className={styles.modalSub}>
              Order #{selectedDispute.orderId} • Total Escrow: {selectedDispute.amountQi.toLocaleString()} Qi
            </p>

            <form onSubmit={handleResolveDisputeSubmit} className={styles.modalForm}>
              <div className={styles.splitBox}>
                <div className={styles.splitHeader}>
                  <span>Buyer Share: <strong>{splitPercent}%</strong> ({Math.round((selectedDispute.amountQi * splitPercent) / 100).toLocaleString()} Qi)</span>
                  <span>Seller Share: <strong>{100 - splitPercent}%</strong> ({Math.round((selectedDispute.amountQi * (100 - splitPercent)) / 100).toLocaleString()} Qi)</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              {!isArbitratorAuthorized && (
                <div style={{ color: "#EF4444", fontSize: "0.82rem", margin: "12px 0", background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "6px" }}>
                  Warning: Connected wallet ({account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "None"}) is not authorized to sign arbitrator resolutions.
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outlined" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !isArbitratorAuthorized}>
                  {loading ? "Signing Settlement..." : `Confirm Settlement Split (${splitPercent}% / ${100 - splitPercent}%)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
