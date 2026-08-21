"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import OrdersTable from "@/components/OrdersTable";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import styles from "./Dashboard.module.css";

const MOCK_APPLICATIONS = [
  {
    id: "app-default-1",
    taskId: "task-001",
    taskTitle: "Quai Cyprus-1 Subgraph Indexer & Analytics API",
    rewardQi: 1500,
    type: "milestone",
    creator: "0x001c...3f47",
    proposal: "Will deploy a Graph Protocol indexer node on Cyprus-1 with GraphQL API endpoints for real-time escrow analytics.",
    timeline: "5 Days",
    portfolio: "https://github.com/senmalong/quai-indexer",
    submittedAt: "Aug 20, 2026",
    status: "Under Review",
    statusType: "review",
  },
  {
    id: "app-default-2",
    taskId: "task-002",
    taskTitle: "Quai Mobile Wallet iOS/Android SDK",
    rewardQi: 2500,
    type: "bounty",
    creator: "0x0035...fbc6",
    proposal: "React Native SDK wrapper around Pelagus Provider API with bio-authentication and instant Qi transfer support.",
    timeline: "7 Days",
    portfolio: "https://github.com/senmalong/quai-mobile-sdk",
    submittedAt: "Aug 18, 2026",
    status: "Shortlisted",
    statusType: "shortlisted",
  },
];

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

  // Tab State: 'orders' | 'applications'
  const [activeMainTab, setActiveMainTab] = useState("orders");
  const [userApplications, setUserApplications] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlOrg = urlParams.get("org");
      const urlDomain = urlParams.get("domain");
      const urlMode = urlParams.get("mode");
      const urlTab = urlParams.get("tab");

      if (urlTab === "applications") {
        setActiveMainTab("applications");
      }

      // Check if user has a saved org profile → corporate mode
      const saved = localStorage.getItem("moneepay_active_org");
      let hasCorporateProfile = false;
      let parsedOrg = null;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.name) {
            parsedOrg = parsed;
            hasCorporateProfile = true;
          }
        } catch (e) {
          console.warn("Failed to parse saved org profile:", e);
        }
      }

      // Load submitted task applications from localStorage
      try {
        const savedApps = localStorage.getItem("moneepay_my_applications");
        if (savedApps) {
          const parsed = JSON.parse(savedApps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUserApplications(parsed);
          } else {
            setUserApplications(MOCK_APPLICATIONS);
          }
        } else {
          setUserApplications(MOCK_APPLICATIONS);
        }
      } catch (e) {
        setUserApplications(MOCK_APPLICATIONS);
      }

      // Determine view state
      const targetMode = urlMode || (hasCorporateProfile || urlOrg ? "corporate" : "connected");

      queueMicrotask(() => {
        if (urlOrg) {
          setActiveOrg((prev) => ({
            ...prev,
            name: urlOrg,
            domain: urlDomain || prev.domain,
          }));
        } else if (parsedOrg) {
          setActiveOrg(parsedOrg);
        }
        setViewState(targetMode);
      });
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
        { id: "act-3", text: "Submitted application for Quai Subgraph Indexer", amount: "1,500 Qi", time: "Yesterday", type: "info" },
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
                {isCorporate ? `${activeOrg.name} Treasury Hub` : "Welcome back, Doris"}
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
                : "Manage your active escrows, payments, and submitted task applications."}
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
              {/* Left Column: Orders & Applications Table Pane */}
              <div className={styles.leftCol}>
                {/* Dashboard Navigation Tabs */}
                <div className={styles.tabNavContainer}>
                  <button
                    className={`${styles.tabBtn} ${activeMainTab === "orders" ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveMainTab("orders")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{isCorporate ? `${activeOrg.name} Vendor Escrows` : "Active Orders & Escrows"}</span>
                    <span className={styles.tabCountBadge}>{ordersData.length}</span>
                  </button>

                  <button
                    className={`${styles.tabBtn} ${activeMainTab === "applications" ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveMainTab("applications")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>My Task Applications</span>
                    <span className={styles.tabCountBadge}>{userApplications.length}</span>
                  </button>
                </div>

                {/* TAB 1: ORDERS TABLE */}
                {activeMainTab === "orders" && (
                  <div className={`${styles.ordersSection} glass-card`}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>
                        {isCorporate ? `${activeOrg.name} Payrolls & Vendor Escrows` : "Active Escrow Orders"}
                      </h2>
                      <span className={styles.orderCount}>
                        {viewState === "empty" ? "0 Records" : `${ordersData.length} Active Records`}
                      </span>
                    </div>
                    <OrdersTable ordersData={ordersData} viewState={viewState} />
                  </div>
                )}

                {/* TAB 2: MY APPLICATIONS TABLE */}
                {activeMainTab === "applications" && (
                  <div className={`${styles.ordersSection} glass-card`}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h2 className={styles.sectionTitle}>My Task & Bounty Applications</h2>
                        <p className={styles.sectionSub}>Track the status of all solver proposals submitted on Quai Network.</p>
                      </div>
                      <Link href="/tasks" className="btn btn-primary btn-sm">
                        + Browse Tasks
                      </Link>
                    </div>

                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Task Title & Type</th>
                            <th>Bounty Reward</th>
                            <th>Creator</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userApplications.map((app) => (
                            <tr key={app.id}>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span style={{ fontWeight: 700, color: "#F8FAFC" }}>{app.taskTitle}</span>
                                  <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                                    Timeline: {app.timeline || "3 Days"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <strong style={{ color: "#00D4AA", fontSize: "1rem" }}>
                                  {app.rewardQi.toLocaleString()} Qi
                                </strong>
                              </td>
                              <td>
                                <code style={{ color: "#94A3B8", fontSize: "0.82rem" }}>{app.creator}</code>
                              </td>
                              <td style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                                {app.submittedAt}
                              </td>
                              <td>
                                <span className={`${styles.statusBadgeApp} ${app.statusType === "shortlisted" ? styles.statusShortlisted : styles.statusReview}`}>
                                  <span className={styles.statusDotApp} />
                                  {app.status}
                                </span>
                              </td>
                              <td>
                                <Link href="/tasks" className={styles.tableActionLink}>
                                  View Task →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {userApplications.length === 0 && (
                        <div className={styles.emptyTableState}>
                          <p style={{ color: "#94A3B8", margin: "20px 0" }}>You haven&apos;t submitted any task applications yet.</p>
                          <Link href="/tasks" className="btn btn-primary btn-sm">
                            Browse Tasks & Apply
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        <Link href="/tasks" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                          </svg>
                          <span>Browse Tasks & Apply</span>
                        </Link>

                        <Link href="/order/create" className="btn btn-outlined" style={{ width: "100%", justifyContent: "flex-start" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Create New Order</span>
                        </Link>

                        <FarcasterShareButton text="Managing my escrow transactions and task applications on MoneePay!" />
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
