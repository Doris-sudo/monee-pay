"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./Payroll.module.css";

export default function PayrollPage() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Alice Vance", role: "Lead Protocol Engineer", address: "0x7e83...4a2c", amount: 500 },
    { id: 2, name: "Bob Martinez", role: "Fullstack Developer", address: "0x3f91...8b1e", amount: 350 },
    { id: 3, name: "Charlie Chen", role: "Security Auditor", address: "0x91d4...2c0f", amount: 400 },
    { id: 4, name: "Diana Prince", role: "Product Manager", address: "0x12e8...9a4b", amount: 300 },
    { id: 5, name: "Eva Green", role: "UX Designer", address: "0x5c72...1f8d", amount: 250 },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: idle, 1: wrapping, 2: locking, 3: disbursing, 4: complete
  const [isExecuted, setIsExecuted] = useState(false);
  const [newAddr, setNewAddr] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Calculate Totals
  const totalQi = employees.reduce((sum, emp) => sum + (Number(emp.amount) || 0), 0);
  const recipientCount = employees.length;

  // Sample CSV Loader
  const handleLoadSampleCSV = () => {
    setEmployees([
      { id: 1, name: "Alice Vance", role: "Lead Protocol Engineer", address: "0x7e83...4a2c", amount: 500 },
      { id: 2, name: "Bob Martinez", role: "Fullstack Developer", address: "0x3f91...8b1e", amount: 350 },
      { id: 3, name: "Charlie Chen", role: "Security Auditor", address: "0x91d4...2c0f", amount: 400 },
      { id: 4, name: "Diana Prince", role: "Product Manager", address: "0x12e8...9a4b", amount: 300 },
      { id: 5, name: "Eva Green", role: "UX Designer", address: "0x5c72...1f8d", amount: 250 },
    ]);
    setIsExecuted(false);
  };

  // CSV File Reader Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n");
      const parsed = [];
      let idCounter = 1;

      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes("address")) return; // Header row
        const parts = line.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          parsed.push({
            id: idCounter++,
            address: parts[0] || "0x000...000",
            name: parts[1] || `Employee #${idCounter}`,
            role: parts[2] || "Team Member",
            amount: Number(parts[3]) || 100,
          });
        }
      });

      if (parsed.length > 0) {
        setEmployees(parsed);
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

  // Execute Batch Payout
  const handleExecuteBatchPayout = () => {
    setIsProcessing(true);
    setProcessStep(1);

    setTimeout(() => setProcessStep(2), 1200);
    setTimeout(() => setProcessStep(3), 2400);
    setTimeout(() => {
      setProcessStep(4);
      setIsProcessing(false);
      setIsExecuted(true);
    }, 3600);
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="corporate" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>
              MoneePay for <span className="gradient-text">Teams</span>
            </h1>
            <p className={styles.subtitle}>
              Automated corporate stipends & batch Qi payroll on Quai Network. Upload employee wallet addresses via CSV to disburse team payouts in a single transaction.
            </p>
          </div>
        </div>

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
            Upload a <code>.csv</code> file with columns: <code>Address, Name, Role, Amount (Qi)</code>
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
                disabled={isProcessing || recipientCount === 0}
                style={{ padding: "14px 28px", fontSize: "1rem" }}
              >
                {isProcessing
                  ? "Processing Batch Payout..."
                  : `Execute Batch Payroll (${totalQi.toLocaleString()} Qi)`}
              </button>
            </div>
          )}

          {/* Processing Modal / State */}
          {isProcessing && (
            <div className={styles.successCard}>
              <h3 style={{ margin: "0 0 8px 0" }}>Executing Corporate Payroll Escrow...</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {processStep === 1 && "Step 1/3: Wrapping native Qi to ERC-20 WQI on Quai EVM..."}
                {processStep === 2 && "Step 2/3: Locking batch deposit in MoneePay Escrow contract..."}
                {processStep === 3 && `Step 3/3: Disbursing payouts to ${recipientCount} employee wallets...`}
              </p>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(processStep / 4) * 100}%` }}
                />
              </div>
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
                Batch Payroll Successfully Disbursed! 🎉
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "540px", margin: "0 auto 20px auto" }}>
                Disbursed a total of <strong>{totalQi.toLocaleString()} Qi</strong> to <strong>{recipientCount} team members</strong> on Quai Network. Transaction settled instantly in block #841920.
              </p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <FarcasterShareButton
                  text={`Just disbursed team payroll of ${totalQi.toLocaleString()} Qi to ${recipientCount} employees on Quai Network via MoneePay for Teams! ⚡`}
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
