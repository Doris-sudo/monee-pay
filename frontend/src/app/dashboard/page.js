"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import OrdersTable from "@/components/OrdersTable";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  // View Modes: 'connected' (individual) | 'corporate' | 'empty' | 'disconnected'
  const [viewState, setViewState] = useState("connected");
  const [walletAddress] = useState("0x7e83...4a2c");
  const [activeOrg, setActiveOrg] = useState({
    name: "Web3 Jos",
    domain: "acme.xyz",
    treasury: "0x7e83...4a2c",
    role: "Payroll Admin / Founder",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlOrg = urlParams.get("org");
      const urlDomain = urlParams.get("domain");
      const urlMode = urlParams.get("mode");

      // Check if user has a saved org profile → corporate mode
      const saved = localStorage.getItem("moneepay_active_org");
      let hasCorporateProfile = false;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.name) {
            setActiveOrg(parsed);
            hasCorporateProfile = true;
          }
        } catch (e) {
          console.warn("Failed to parse saved org profile:", e);
        }
      }

      // URL params override — corporate onboarding redirect
      if (urlOrg) {
        setActiveOrg((prev) => ({
          ...prev,
          name: urlOrg,
          domain: urlDomain || prev.domain,
        }));
        hasCorporateProfile = true;
      }

      // Determine view state
      if (urlMode) {
        setViewState(urlMode);
      } else if (hasCorporateProfile) {
        setViewState("corporate");
      } else {
        // Default: individual connected wallet
        setViewState("connected");
      }
    }
  }, []);

  const isCorporate = viewState === "corporate";
  const isIndividual = viewState === "connected" || viewState === "empty";

  const individualOrders = [
    {
      id: "MNP-0042",
      parties: "Alice → You",
      amount: "500 Qi",
      status: "Funded",
      statusType: "funded",
      deadline: "Aug 19, 2026",
      href: "/order/82hd91",
    },
    {
      id: "MNP-0041",
      parties: "You → Charlie",
      amount: "250 Qi",
      status: "Awaiting Delivery",
      statusType: "awaiting",
      deadline: "Aug 15, 2026",
      href: "/order/82hd91",
    },
    {
      id: "MNP-0040",
      parties: "Dave → You",
      amount: "1,200 Qi",
      status: "Milestone 2/3",
      statusType: "milestone",
      deadline: "Sep 01, 2026",
      href: "/order/82hd91",
    },
  ];

  const corporateOrders = [
    {
      id: "CORP-1092",
      parties: `${activeOrg.name} Treasury → 5 Employees`,
      amount: "1,800 Qi",
      status: "Batch Payroll Settled",
      statusType: "completed",
      deadline: "Aug 15, 2026",
      href: "/payroll",
    },
    {
      id: "CORP-1091",
      parties: `${activeOrg.name} Treasury → TrailOfBits`,
      amount: "1,200 Qi",
      status: "Milestone 2/3 (Audits)",
      statusType: "milestone",
      deadline: "Sep 01, 2026",
      href: "/order/82hd91",
    },
    {
      id: "CORP-1090",
      parties: `${activeOrg.name} Treasury → AWS Quai Node`,
      amount: "450 Qi",
      status: "Funded Escrow",
      statusType: "funded",
      deadline: "Aug 28, 2026",
      href: "/order/82hd91",
    },
  ];

  const ordersData = isCorporate ? corporateOrders : individualOrders;

  const activityFeed = isCorporate
    ? [
        { id: "corp-1", text: `Batch Payroll of 1,800 Qi disbursed to 5 team members by ${activeOrg.name}`, amount: "-1,800 Qi", time: "15 mins ago", type: "out" },
        { id: "corp-2", text: `Milestone 2 approved for TrailOfBits Auditor by ${activeOrg.name}`, amount: "-400 Qi", time: "3 hours ago", type: "out" },
        { id: "corp-3", text: `${activeOrg.name} Treasury deposit received`, amount: "+10,000 Qi", time: "Yesterday", type: "in" },
        { id: "corp-4", text: "AWS Quai Node escrow contract created", amount: "450 Qi", time: "2 days ago", type: "info" },
      ]
    : [
        { id: "act-1", text: "Order #MNP-0042 funded by Alice", amount: "+500 Qi", time: "10 mins ago", type: "in" },
        { id: "act-2", text: "Milestone 2 approved for Order #MNP-0040", amount: "+400 Qi", time: "2 hours ago", type: "in" },
        { id: "act-3", text: "Payment released for Order #MNP-0038", amount: "-450 Qi", time: "Yesterday", type: "out" },
      ];

  return (
    <div className={styles.layoutContainer}>
      <Sidebar
        user={{ name: isCorporate ? activeOrg.name : "Doris", address: activeOrg.treasury || walletAddress }}
        mode={isCorporate ? "corporate" : "individual"}
      />

      <main className={styles.mainArea}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greetingGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 className={styles.greetingTitle}>
                {isCorporate ? `🏢 ${activeOrg.name} Treasury Hub` : "Welcome back, Doris 👋"}
              </h1>
              {isCorporate && (
                <span className={styles.orgRoleBadge}>
                  {activeOrg.domain} ({activeOrg.role})
                </span>
              )}
            </div>
            <p className={styles.greetingSub}>
              {isCorporate
                ? `Manage corporate treasury, employee batch payrolls, vendor escrows, and audit logs for ${activeOrg.name}.`
                : "Manage your active escrows, payments, and task rewards."}
            </p>
          </div>

          <div className={styles.headerRight}>
            {viewState === "disconnected" ? (
              <button className="btn btn-primary btn-sm" onClick={() => setViewState("connected")}>
                Connect Wallet
              </button>
            ) : (
              <div className={styles.walletBadge}>
                <span className={styles.greenDot} />
                <span>
                  {isCorporate ? "Treasury: " : "Wallet: "}
                  <strong className={styles.walletAddr}>{activeOrg.treasury || walletAddress}</strong>
                </span>
              </div>
            )}
          </div>
        </header>

        {viewState === "disconnected" ? (
          <div className={`${styles.disconnectedCard} glass-card`}>
            <div className={styles.disconnectedIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2>Wallet Disconnected</h2>
            <p>Please connect your Pelagus Wallet to view your escrows and manage payments.</p>
            <button className="btn btn-primary" onClick={() => setViewState("connected")} style={{ marginTop: "16px" }}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <StatsGrid viewState={viewState} />

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
              {/* Left Column: Orders Table */}
              <div className={styles.leftCol}>
                <div className={`${styles.ordersSection} glass-card`}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      {isCorporate ? `${activeOrg.name} Payrolls & Vendor Escrows` : "Active Orders"}
                    </h2>
                    <span className={styles.orderCount}>
                      {viewState === "empty" ? "0 Records" : `${ordersData.length} Active Records`}
                    </span>
                  </div>
                  <OrdersTable ordersData={ordersData} viewState={viewState} />
                </div>
              </div>

              {/* Right Column: Quick Actions & Activity Feed */}
              <div className={styles.rightCol}>
                <div className={`${styles.actionPanel} glass-card`}>
                  <h3 className={styles.panelTitle}>
                    {isCorporate ? `${activeOrg.name} Quick Actions` : "Quick Actions"}
                  </h3>
                  <div className={styles.actionButtons}>
                    {isCorporate ? (
                      <>
                        <Link href="/payroll" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          <span>Disburse Team Payroll</span>
                        </Link>

                        <Link href="/order/create" className="btn btn-outlined" style={{ width: "100%", justifyContent: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Create Contractor Escrow</span>
                        </Link>

                        <FarcasterShareButton text={`${activeOrg.name} Corporate Treasury Hub powered by MoneePay on Quai Network!`} />
                      </>
                    ) : (
                      <>
                        <Link href="/order/create" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Create New Order</span>
                        </Link>

                        <FarcasterShareButton text="Managing my escrow transactions on MoneePay!" />
                      </>
                    )}
                  </div>
                </div>

                {/* Upgrade to Corporate Prompt (individual only) */}
                {isIndividual && (
                  <div className={`${styles.upgradeCard} glass-card`}>
                    <div className={styles.upgradeIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h4 className={styles.upgradeTitle}>Unlock Corporate Features</h4>
                    <p className={styles.upgradeDesc}>
                      Register your organization to access batch payroll, treasury management, and vendor escrows.
                    </p>
                    <Link href="/?openOrg=true" className={styles.upgradeLink}>
                      Register as Corporate →
                    </Link>
                  </div>
                )}

                {/* Activity Feed */}
                <div className={`${styles.activityPanel} glass-card`}>
                  <h3 className={styles.panelTitle}>
                    {isCorporate ? `${activeOrg.name} Audit Log` : "Recent Activity"}
                  </h3>
                  <div className={styles.activityList}>
                    {activityFeed.map((item) => (
                      <div key={item.id} className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                          <span className={styles.activityText}>{item.text}</span>
                          <span className={styles.activityTime}>{item.time}</span>
                        </div>
                        <span className={`${styles.activityAmount} ${item.type === "in" ? styles.amountIn : ""}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
