"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import ExplorerLink from "@/components/ExplorerLink";
import { useMilestoneEscrow } from "@/hooks/useMilestoneEscrow";
import styles from "./Tasks.module.css";

const MOCK_TASKS = [
  {
    id: "task-001",
    title: "Audit MoneePay Smart Contract (Solidity)",
    description:
      "Perform a full security audit of the MoneePay EVM escrow contracts on Quai Network. Deliverables include vulnerability report, gas optimization suggestions, and final sign-off.",
    reward: 1200,
    type: "milestone",
    difficulty: "hard",
    creator: { address: "0x001c...3f47", initial: "D" },
    deadline: "Sep 01, 2026",
    orderId: "k2m9x4",
    milestones: [
      { title: "Initial Review & Scope", amount: 400 },
      { title: "Vulnerability Report", amount: 400 },
      { title: "Final Sign-off & Fixes", amount: 400 },
    ],
  },
  {
    id: "task-002",
    title: "Build React Landing Page for DeFi Protocol",
    description:
      "Design and code a responsive landing page with hero section, feature grid, tokenomics chart, and team section. Must use Next.js 15 and follow dark-mode fintech aesthetic.",
    reward: 800,
    type: "bounty",
    difficulty: "medium",
    creator: { address: "0x0035...fbc6", initial: "Q" },
    deadline: "Aug 30, 2026",
    orderId: "f7j2k9",
    milestones: [],
  },
];

export default function TasksPage() {
  const { tasks: onChainTasks, loading: onChainLoading } = useMilestoneEscrow();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Merge live MilestoneEscrow tasks with mock items (#28)
  const allTasks = useMemo(() => {
    return [...onChainTasks, ...MOCK_TASKS];
  }, [onChainTasks]);

  const filteredTasks = useMemo(() => {
    return allTasks
      .filter((t) => {
        const matchesTab = activeTab === "all" || t.type === activeTab;
        const matchesQuery =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "reward-high") return b.reward - a.reward;
        if (sortBy === "reward-low") return a.reward - b.reward;
        return 0;
      });
  }, [allTasks, activeTab, searchQuery, sortBy]);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div>
            <span className={styles.badgeLabel}>⚡ Milestone & Bounty Escrow</span>
            <h1 className={styles.title}>
              Task & Bounty <span className="gradient-text">Discovery Hub</span>
            </h1>
            <p className={styles.subtitle}>
              Earn Qi by solving bounties and completing milestone tasks for Web3 projects on Quai Network. Guaranteed payout upon milestone delivery.
            </p>
          </div>

          <Link href="/order/create" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            + Create Task Escrow
          </Link>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Tasks ({allTasks.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "milestone" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("milestone")}
            >
              Milestone Escrows
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "bounty" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("bounty")}
            >
              Single Bounties
            </button>
          </div>

          <div className={styles.searchSortGroup}>
            <input
              type="text"
              placeholder="Search tasks..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="reward-high">Reward: High to Low</option>
              <option value="reward-low">Reward: Low to High</option>
            </select>
          </div>
        </div>

        {/* Indexing Indicator (#28) */}
        {onChainLoading && (
          <div style={{ color: "#00D4AA", fontSize: "0.9rem", padding: "10px 0" }}>
            ⏳ Indexing live MilestoneEscrow smart contract events on Quai Cyprus-1...
          </div>
        )}

        {/* Task Grid */}
        <div className={styles.grid}>
          {filteredTasks.map((t) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.typeBadge} ${styles["type_" + t.type]}`}>
                  {t.type === "milestone" ? "🎯 Milestone Escrow" : "⚡ Single Bounty"}
                </span>
                <span className={styles.difficultyBadge}>{t.difficulty}</span>
              </div>

              <h3 className={styles.cardTitle}>{t.title}</h3>
              <p className={styles.cardDesc}>{t.description}</p>

              {t.milestones && t.milestones.length > 0 && (
                <div className={styles.trancheBox}>
                  <span className={styles.trancheLabel}>Tranches:</span>
                  <div className={styles.tranchePills}>
                    {t.milestones.map((m, idx) => (
                      <span key={idx} className={styles.tranchePill}>
                        M{idx + 1}: {m.amount} Qi
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.cardMeta}>
                <div>
                  <span className={styles.metaLabel}>Total Reward Escrow</span>
                  <div className={styles.rewardVal}>{t.reward.toLocaleString()} Qi</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className={styles.metaLabel}>Creator</span>
                  <div className={styles.creatorAddr}>{t.creator.address}</div>
                </div>
              </div>

              <div style={{ margin: "10px 0 6px 0" }}>
                <ExplorerLink hash="0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA" label="MilestoneEscrow Contract Receipt" />
              </div>

              <div className={styles.cardFooter}>
                <Link href={`/order/${t.orderId}`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  View Task & Apply ({t.reward.toLocaleString()} Qi)
                </Link>
                <FarcasterShareButton
                  text={`Check out this task bounty: ${t.title} (${t.reward} Qi) on Quai Network! ⚡`}
                  buttonText="Share Task"
                />
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </main>
    </div>
  );
}
