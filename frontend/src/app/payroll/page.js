"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import { useEscrowContracts } from "@/hooks/useEscrowContracts";
import { useWallet } from "@/hooks/useWallet";
import styles from "./Payroll.module.css";

export default function PayrollPage() {
  const { isConnected, connectWallet } = useWallet();
  const { disburseBatch, parsePayrollCSV, grantAdmin, revokeAdmin, loading, error: contractError } = useEscrowContracts();

  const [employees, setEmployees] = useState([
    { id: 1, name: "Alice Vance", role: "Lead Protocol Engineer", address: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47", amount: 500 },
    { id: 2, name: "Bob Martinez", role: "Fullstack Developer", address: "0x00354572C988dB5ca96827B091a59dAea71Bfbc6", amount: 350 },
    { id: 3, name: "Charlie Chen", role: "Security Auditor", address: "0x000E6e8eE75Ccea4A0fFBE88F378ce732de8fbA", amount: 400 },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [executedTxHash, setExecutedTxHash] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Admin RBAC State
  const [adminAddr, setAdminAddr] = useState("");
  const [adminStatusMsg, setAdminStatusMsg] = useState("");

  // Calculate Totals
  const totalQi = employees.reduce((sum, emp) => sum + (Number(emp.amount) || 0), 0);
  const recipientCount = employees.length;

  // Sample CSV Loader
  const handleLoadSampleCSV = () => {
    setEmployees([
      { id: 1, name: "Alice Vance", role: "Lead Protocol Engineer", address: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47", amount: 500 },
      { id: 2, name: "Bob Martinez", role: "Fullstack Developer", address: "0x00354572C988dB5ca96827B091a59dAea71Bfbc6", amount: 350 },
      { id: 3, name: "Charlie Chen", role: "Security Auditor", address: "0x000E6e8eE75Ccea4A0fFBE88F378ce732de8fbA", amount: 400 },
    ]);
    setIsExecuted(false);
  };

  // CSV File Reader Handler using parsePayrollCSV helper
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const { records, errors } = parsePayrollCSV(text);

      if (errors.length > 0) {
        alert(`CSV Parsing Warnings:\n${errors.join("\n")}`);
      }

      if (records.length > 0) {
        const parsedRows = records.map((r, idx) => ({
          id: idx + 1,
          name: `Team Member #${idx + 1}`,
          role: "Contributor",
          address: r.address,
          amount: r.amount,
        }));
        setEmployees(parsedRows);
        setIsExecuted(false);
      }
    };
    reader.readAsText(file);
  };

  // Handle Amount Edit
  const handleAmountChange = (id, val) => {
    setEmployees(employees.map((e) => (e.id === id ? { ...e, amount: Number(val) || 0 } : e)));
  };

  // Remove Employee Row
  const handleRemoveRow = (id) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  // Add Custom Employee Row
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newAddr || !newAmount) return;
    setEmployees([
      ...employees,
      {
        id: Date.now(),
        name: newName || "Team Member",
        role: newRole || "Contributor",
        address: newAddr,
        amount: Number(newAmount) || 100,
      },
    ]);
    setNewAddr("");
    setNewName("");
    setNewRole("");
    setNewAmount("");
  };

  // Execute On-Chain Batch Payout via BatchPayroll contract
  const handleExecuteBatchPayout = async () => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    setIsProcessing(true);
    try {
      const recipients = employees.map((e) => e.address);
      const amounts = employees.map((e) => e.amount);

      const hash = await disburseBatch(recipients, amounts);
      setExecutedTxHash(hash);
      setIsProcessing(false);
      setIsExecuted(true);
    } catch (err) {
      console.error("Batch disburse error:", err);
      setIsProcessing(false);
    }
  };

  // Admin RBAC handlers
  const handleGrantAdmin = async () => {
    if (!adminAddr) return;
    if (!isConnected) {
      setAdminStatusMsg("Error: Please connect authorized corporate treasury wallet.");
      connectWallet();
      return;
    }
    try {
      const hash = await grantAdmin(adminAddr);
      setAdminStatusMsg(`Admin granted to ${adminAddr}. Tx: ${hash}`);
      setAdminAddr("");
    } catch (err) {
      setAdminStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleRevokeAdmin = async () => {
    if (!adminAddr) return;
    if (!isConnected) {
      setAdminStatusMsg("Error: Please connect authorized corporate treasury wallet.");
      connectWallet();
      return;
    }
    try {
      const hash = await revokeAdmin(adminAddr);
      setAdminStatusMsg(`Admin revoked from ${adminAddr}. Tx: ${hash}`);
      setAdminAddr("");
    } catch (err) {
      setAdminStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="corporate" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.titleGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                background: isConnected ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                border: isConnected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                color: isConnected ? "#10B981" : "#F59E0B",
              }}>
                {isConnected ? "Authorized Treasury Admin" : "Wallet Disconnected"}
              </span>
            </div>
            <h1 className={styles.title}>
              MoneePay for <span className="gradient-text">Teams & Payroll</span>
            </h1>
            <p className={styles.subtitle}>
              Automated corporate stipends & batch Qi payroll on Quai Network. Single-transaction multi-recipient salary disbursements via <code>BatchPayroll.sol</code> (95% gas savings).
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
            Payroll Contract Error: {contractError}
          </div>
        )}

        {/* Upload Card */}
        <div className={styles.uploadCard}>
          <div className={styles.uploadIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className={styles.uploadTitle}>Import Employee Payroll CSV</h3>
          <p className={styles.uploadSub}>
            Upload a <code>.csv</code> file with columns: <code>Address, Amount (Qi)</code>
          </p>

          <div className={styles.btnRow}>
            <label className="btn btn-primary" style={{ cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload CSV File</span>
              <input type="file" accept=".csv" className={styles.fileInput} onChange={handleFileUpload} />
            </label>

            <button type="button" className="btn btn-outlined" onClick={handleLoadSampleCSV}>
              Load Sample Tech Payroll CSV
            </button>
          </div>
        </div>

        {/* Admin RBAC Bar */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#F8FAFC" }}>🔐 BatchPayroll Admin RBAC Management</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="0x... Quai Wallet Address"
              value={adminAddr}
              onChange={(e) => setAdminAddr(e.target.value)}
              className={styles.numInput}
              style={{ flex: 1, minWidth: "220px" }}
            />
            <button className="btn btn-outlined btn-sm" onClick={handleGrantAdmin}>
              Grant Admin
            </button>
            <button className="btn btn-outlined btn-sm" onClick={handleRevokeAdmin} style={{ borderColor: "#F87171", color: "#F87171" }}>
              Revoke Admin
            </button>
          </div>
          {adminStatusMsg && (
            <p style={{ margin: "8px 0 0 0", fontSize: "0.82rem", color: "#00D4AA" }}>{adminStatusMsg}</p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Qi Lockup Deposit</span>
            <div className={`${styles.metricVal} ${styles.metricValTeal}`}>{totalQi.toLocaleString()} Qi</div>
            <span className={styles.metricSub}>Auto-wraps to WQI for EVM execution</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Employee Recipients</span>
            <div className={styles.metricVal}>{recipientCount} Employees</div>
            <span className={styles.metricSub}>Disbursed in 1 batch transaction</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Avg. Stipend Payout</span>
            <div className={styles.metricVal}>
              {recipientCount ? Math.round(totalQi / recipientCount) : 0} Qi
            </div>
            <span className={styles.metricSub}>Per team member</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Network Efficiency</span>
            <div className={styles.metricVal} style={{ color: "#00B4D8" }}>95% Gas Savings</div>
            <span className={styles.metricSub}>VS individual transfer calls</span>
          </div>
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Payroll Disbursement Table</h2>
            <span className={styles.badgeCount}>{recipientCount} Recipients Loaded</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee / Contributor</th>
                  <th>Quai Wallet Address</th>
                  <th>Qi Stipend Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className={styles.empInfo}>
                        <div className={styles.avatar}>{emp.name.charAt(0)}</div>
                        <div>
                          <span className={styles.empName}>{emp.name}</span>
                          <span className={styles.empRole}>{emp.role}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.addrCode}>{emp.address}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          className={styles.numInput}
                          value={emp.amount}
                          onChange={(e) => handleAmountChange(emp.id, e.target.value)}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#00D4AA" }}>Qi</span>
                      </div>
                    </td>
                    <td>
                      <button className={styles.removeBtn} onClick={() => handleRemoveRow(emp.id)} title="Remove row">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Add Row */}
          <form onSubmit={handleAddEmployee} className={styles.addEmpRow}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%", marginTop: "16px" }}>
              <input
                type="text"
                placeholder="Employee Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={styles.numInput}
                style={{ width: "160px" }}
              />
              <input
                type="text"
                placeholder="Role / Title"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className={styles.numInput}
                style={{ width: "140px" }}
              />
              <input
                type="text"
                placeholder="0x... Wallet Address"
                value={newAddr}
                onChange={(e) => setNewAddr(e.target.value)}
                className={styles.numInput}
                style={{ flex: 1, minWidth: "200px" }}
              />
              <input
                type="number"
                placeholder="Qi Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className={styles.numInput}
                style={{ width: "120px" }}
              />
              <button type="submit" className="btn btn-outlined btn-sm">
                + Add Member
              </button>
            </div>
          </form>

          {/* Execute Bar */}
          {!isExecuted && (
            <div className={styles.executeBar}>
              <div className={styles.executeSummary}>
                <span className={styles.executeTotal}>
                  Total Payout: {totalQi.toLocaleString()} Qi
                </span>
                <span className={styles.executeSub}>
                  Disbursing to {recipientCount} verified team wallets on Quai Network
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExecuteBatchPayout}
                disabled={isProcessing || loading || recipientCount === 0}
                style={{ padding: "14px 28px", fontSize: "1rem" }}
              >
                {isProcessing || loading
                  ? "Signing & Disbursing Batch Payout..."
                  : `Execute Batch Payroll (${totalQi.toLocaleString()} Qi)`}
              </button>
            </div>
          )}

          {/* Success Receipt State */}
          {isExecuted && !isProcessing && (
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 8px 0" }}>
                Batch Payroll Successfully Disbursed
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "540px", margin: "0 auto 12px auto" }}>
                Disbursed a total of <strong>{totalQi.toLocaleString()} Qi</strong> to <strong>{recipientCount} team members</strong> via <code>BatchPayroll</code> smart contract.
              </p>

              {executedTxHash && (
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
                    href={`https://orchard.quaiscan.io/tx/${executedTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#00D4AA", textDecoration: "underline" }}
                  >
                    {executedTxHash}
                  </a>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <FarcasterShareButton
                  text={`Just disbursed team payroll of ${totalQi.toLocaleString()} Qi to ${recipientCount} employees on Quai Network via MoneePay for Teams!`}
                  buttonText="Share Payout Receipt to Farcaster"
                />
                <button
                  className="btn btn-outlined"
                  onClick={() => setIsExecuted(false)}
                >
                  Create New Batch
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
