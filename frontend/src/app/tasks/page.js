"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
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
    contractAddress: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
    milestones: [
      { title: "Initial Scope", amount: 400 },
      { title: "Vulnerability Audit", amount: 400 },
      { title: "Final Sign-off", amount: 400 },
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
    contractAddress: "0x0067f487e59f0C45922854F32B6d8deD8e820776",
    milestones: [],
  },
  {
    id: "task-003",
    title: "Integrate Farcaster Mini App Frames & SDK v2",
    description:
      "Implement deep links, mobile hamburger drawer navigation, and share buttons for Farcaster protocol within MoneePay payment widgets on Quai Cyprus-1.",
    reward: 1500,
    type: "milestone",
    difficulty: "medium",
    creator: { address: "0x002a...e901", initial: "F" },
    deadline: "Sep 10, 2026",
    orderId: "m8b3v1",
    contractAddress: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
    milestones: [
      { title: "SDK Init & Frame Hooks", amount: 750 },
      { title: "Mobile UI & Share Flow", amount: 750 },
    ],
  },
  {
    id: "task-004",
    title: "Solidity Gas Optimization for Batch Payroll",
    description:
      "Optimize batch transfer loops and packed struct storage slots in BatchPayroll.sol contract to lower Qi gas fees by at least 25%.",
    reward: 600,
    type: "bounty",
    difficulty: "easy",
    creator: { address: "0x0089...11c4", initial: "G" },
    deadline: "Aug 28, 2026",
    orderId: "p4t9w2",
    contractAddress: "0x0091ab45cd67ef890a1234567890abcdef123456",
    milestones: [],
  },
];

export default function TasksPage() {
  const { tasks: onChainTasks, loading: onChainLoading } = useMilestoneEscrow();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Merge live MilestoneEscrow tasks with mock catalog items (#28)
  const allTasks = useMemo(() => {
    const liveItems = onChainTasks.map((t, idx) => ({
      id: t.id || `live-task-${idx}`,
      title: t.title || "On-Chain Milestone Task",
      description: t.description || "Live task escrow on Quai Cyprus-1 smart contract.",
      reward: t.reward || 500,
      type: "milestone",
      difficulty: "medium",
      creator: { address: t.creator ? `${t.creator.slice(0, 6)}...${t.creator.slice(-4)}` : "0x001c...3f47", initial: "Q" },
      deadline: "Flexible",
      orderId: t.id ? t.id.slice(0, 8) : "k2m9x4",
      contractAddress: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
      milestones: t.milestones || [{ title: "Delivery", amount: t.reward || 500 }],
    }));
    return [...liveItems, ...MOCK_TASKS];
  }, [onChainTasks]);

  // Aggregate Stats
  const totalRewardVolume = useMemo(() => {
    return allTasks.reduce((acc, curr) => acc + (curr.reward || 0), 0);
  }, [allTasks]);

  const avgTaskReward = useMemo(() => {
    return allTasks.length > 0 ? Math.round(totalRewardVolume / allTasks.length) : 0;
  }, [allTasks, totalRewardVolume]);

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
        {/* Header Hero Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <span className={styles.badgeLabel}>⚡ Milestone & Bounty Escrow</span>
            <h1 className={styles.title}>
              Task & Bounty <span className="gradient-text">Discovery Hub</span>
            </h1>
            <p className={styles.subtitle}>
              Earn Qi by solving bounties and delivering milestone tasks for Web3 projects on Quai Network. Guaranteed payout upon delivery approval.
            </p>
          </div>

          <Link href="/order/create" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            + Create Task Escrow
          </Link>
        </div>

        {/* Stats Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalRewardVolume.toLocaleString()} Qi</div>
            <div className={styles.statLabel}>Total Reward Volume</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{allTasks.length} Tasks</div>
            <div className={styles.statLabel}>Active Bounties & Escrows</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{avgTaskReward.toLocaleString()} Qi</div>
            <div className={styles.statLabel}>Average Task Payout</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>100% On-Chain</div>
            <div className={styles.statLabel}>Smart Contract SLA</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks, skills, or bounties..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${activeTab === "all" ? styles.filterTabActive : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Tasks ({allTasks.length})
            </button>
            <button
              className={`${styles.filterTab} ${activeTab === "milestone" ? styles.filterTabActive : ""}`}
              onClick={() => setActiveTab("milestone")}
            >
              🎯 Milestone Escrows
            </button>
            <button
              className={`${styles.filterTab} ${activeTab === "bounty" ? styles.filterTabActive : ""}`}
              onClick={() => setActiveTab("bounty")}
            >
              ⚡ Single Bounties
            </button>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            Showing <strong>{filteredTasks.length}</strong> of {allTasks.length} available tasks
          </span>

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

        {/* Indexing Smart Contract Indicator (#28) */}
        {onChainLoading && (
          <div className={styles.loadingBox}>
            <span className={styles.loadingSpinner}>⏳</span>
            <span>Indexing live MilestoneEscrow smart contract events on Quai Cyprus-1...</span>
          </div>
        )}

        {/* Tasks Grid */}
        <div className={styles.tasksList}>
          {filteredTasks.map((t) => (
            <div key={t.id} className={styles.taskCard}>
              {/* Card Top Header */}
              <div className={styles.taskHeader}>
                <div className={styles.taskTitleGroup}>
                  <div className={styles.taskBadges}>
                    <span className={`${styles.typeBadge} ${t.type === "milestone" ? styles.typeMilestone : styles.typeBounty}`}>
                      {t.type === "milestone" ? "🎯 Milestone Escrow" : "⚡ Single Bounty"}
                    </span>
                    <span
                      className={`${styles.difficultyBadge} ${
                        t.difficulty === "easy"
                          ? styles.diffEasy
                          : t.difficulty === "medium"
                          ? styles.diffMedium
                          : styles.diffHard
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                  <h3 className={styles.taskTitle}>{t.title}</h3>
                </div>

                <div className={styles.rewardTag}>
                  <span className={styles.rewardLabel}>Total Reward</span>
                  <div className={styles.rewardAmount}>
                    {t.reward.toLocaleString()} <span className={styles.rewardCurrency}>Qi</span>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <p className={styles.taskDesc}>{t.description}</p>

              {/* Tranche / Milestone Pills */}
              {t.milestones && t.milestones.length > 0 && (
                <div className={styles.milestonePreview}>
                  {t.milestones.map((m, idx) => (
                    <span key={idx} className={styles.milestoneChip}>
                      <span className={styles.milestoneChipNum}>M{idx + 1}</span>
                      <span>{m.title}:</span>
                      <span className={styles.milestoneChipAmount}>{m.amount} Qi</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Explorer Evidence Link */}
              {t.contractAddress && (
                <div style={{ margin: "12px 0" }}>
                  <ExplorerLink hash={t.contractAddress} label="MilestoneEscrow Contract Receipt" />
                </div>
              )}

              {/* Card Footer & CTAs */}
              <div className={styles.taskFooter}>
                <div className={styles.taskMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.creatorAvatar}>{t.creator.initial}</span>
                    <span className={styles.creatorAddr}>{t.creator.address}</span>
                  </div>
                  <div className={styles.escrowLockBadge}>
                    <span className={styles.lockDot} />
                    <span>Funds Escrowed</span>
                  </div>
                </div>

                <div className={styles.ctaGroup}>
                  <FarcasterShareButton
                    text={`Check out this task bounty: "${t.title}" (${t.reward} Qi) on Quai Network! ⚡`}
                    buttonText="Share Task"
                  />
                  <Link href={`/order/${t.orderId}`} className={styles.claimBtn}>
                    View Task & Apply ({t.reward.toLocaleString()} Qi) →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search/Filter State */}
        {filteredTasks.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3 className={styles.emptyTitle}>No matching tasks found</h3>
            <p className={styles.emptyDesc}>Try adjusting your search query or switching filter tabs.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
