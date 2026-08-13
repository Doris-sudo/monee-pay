"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import OrdersTable from "@/components/OrdersTable";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [viewState, setViewState] = useState("connected");
  const [walletAddress, setWalletAddress] = useState("0x7e83...4a2c");

  const ordersData = [
    {
      id: "MNP-0042",
      parties: "Alice → You",
      amount: "500 Qi",
      status: "Funded",
      statusType: "funded",
      deadline: "Aug 19, 2026",
      href: "/order/82hd91"
    },
    {
      id: "MNP-0041",
      parties: "You → Charlie",
      amount: "250 Qi",
      status: "Awaiting Delivery",
      statusType: "awaiting",
      deadline: "Aug 15, 2026",
      href: "/order/82hd91"
    },
    {
      id: "MNP-0040",
      parties: "Dave → You",
      amount: "1,200 Qi",
      status: "Milestone 2/3",
      statusType: "milestone",
      deadline: "Sep 01, 2026",
      href: "/order/82hd91"
    },
    {
      id: "MNP-0039",
      parties: "Eva → You",
      amount: "80 Qi",
      status: "Disputed",
      statusType: "disputed",
      deadline: "Aug 10, 2026",
      href: "/order/82hd91"
    },
    {
      id: "MNP-0038",
      parties: "You → Frank",
      amount: "450 Qi",
      status: "Completed",
      statusType: "completed",
      deadline: "Aug 02, 2026",
      href: "/order/82hd91"
    }
  ];

  const activityFeed = [
    { id: "act-1", text: "Order #MNP-0042 funded by Alice", amount: "+500 Qi", time: "10 mins ago", type: "in" },
    { id: "act-2", text: "Milestone 2 approved for Order #MNP-0040", amount: "+400 Qi", time: "2 hours ago", type: "in" },
    { id: "act-3", text: "Payment released for Order #MNP-0038", amount: "-450 Qi", time: "Yesterday", type: "out" },
    { id: "act-4", text: "Payment Link generated for MacBook Pro", amount: "500 Qi", time: "2 days ago", type: "info" }
  ];

  return (
    <div className={styles.layoutContainer}>
      <Sidebar user={{ name: "Doris", address: walletAddress }} />

      <main className={styles.mainArea}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greetingGroup}>
            <h1 className={styles.greetingTitle}>Welcome back, Doris 👋</h1>
            <p className={styles.greetingSub}>Manage your active escrows, payments, and team stipends.</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.demoStateToggle}>
              <button 
                className={`${styles.toggleBtn} ${viewState === 'connected' ? styles.toggleActive : ''}`}
                onClick={() => setViewState("connected")}
              >
                Dashboard
              </button>
              <button 
                className={`${styles.toggleBtn} ${viewState === 'empty' ? styles.toggleActive : ''}`}
                onClick={() => setViewState("empty")}
              >
                Empty State
              </button>
              <button 
                className={`${styles.toggleBtn} ${viewState === 'disconnected' ? styles.toggleActive : ''}`}
                onClick={() => setViewState("disconnected")}
              >
                Disconnected
              </button>
            </div>

            {viewState === "disconnected" ? (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setViewState("connected")}
              >
                Connect Wallet
              </button>
            ) : (
              <div className={styles.walletBadge}>
                <span className={styles.greenDot} />
                <span>Connected: <strong className={styles.walletAddr}>{walletAddress}</strong></span>
              </div>
            )}
          </div>
        </header>

        {viewState === "disconnected" ? (
          <div className={`${styles.disconnectedCard} glass-card`}>
            <div className={styles.disconnectedIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2>Wallet Disconnected</h2>
            <p>Please connect your Pelagus Wallet to view your active escrows and manage orders.</p>
            <button className="btn btn-primary" onClick={() => setViewState("connected")} style={{ marginTop: "16px" }}>
              Connect Pelagus Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Stats Row Component */}
            <StatsGrid viewState={viewState} />

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
              {/* Left Column: Orders Table Component */}
              <div className={styles.leftCol}>
                <div className={`${styles.ordersSection} glass-card`}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Active Orders</h2>
                    <span className={styles.orderCount}>
                      {viewState === "empty" ? "0 Orders" : `${ordersData.length} Orders`}
                    </span>
                  </div>
                  <OrdersTable ordersData={ordersData} viewState={viewState} />
                </div>
              </div>

              {/* Right Column: Quick Actions & Activity Feed */}
              <div className={styles.rightCol}>
                <div className={`${styles.actionPanel} glass-card`}>
                  <h3 className={styles.panelTitle}>Quick Actions</h3>
                  <div className={styles.actionButtons}>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <span>Create New Order</span>
                    </button>

                    <button className="btn btn-outlined" style={{ width: "100%", justifyContent: "flex-start" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <span>Generate Payment Link</span>
                    </button>

                    <Link href="/order/82hd91" className="btn btn-outlined" style={{ width: "100%", justifyContent: "flex-start" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <span>View All Orders</span>
                    </Link>
                  </div>
                </div>

                <div className={`${styles.activityPanel} glass-card`}>
                  <h3 className={styles.panelTitle}>Recent Activity</h3>
                  <div className={styles.activityList}>
                    {activityFeed.map((item) => (
                      <div key={item.id} className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                          <span className={styles.activityText}>{item.text}</span>
                          <span className={styles.activityTime}>{item.time}</span>
                        </div>
                        <span className={`${styles.activityAmount} ${item.type === 'in' ? styles.amountIn : ''}`}>
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
