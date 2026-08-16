"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
    creator: { address: "0x7e83...4a2c", initial: "D" },
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
    creator: { address: "0x9c42...1e7a", initial: "Q" },
    deadline: "Aug 30, 2026",
    orderId: "f7j2k9",
    milestones: [],
  },
  {
    id: "task-003",
    title: "Write Technical Documentation for Quai SDK",
    description:
      "Create comprehensive developer documentation for the Quai Network JavaScript SDK. Includes API reference, getting started guide, code samples, and FAQ section.",
    reward: 500,
    type: "bounty",
    difficulty: "easy",
    creator: { address: "0x5d18...3c44", initial: "S" },
    deadline: "Sep 10, 2026",
    orderId: "a3kd82",
    milestones: [],
  },
  {
    id: "task-004",
    title: "Develop Cross-Chain Bridge UI Component",
    description:
      "Build a production-ready cross-chain bridge widget with token selection, chain switching, and real-time fee estimation. Integration with Quai Network + Ethereum.",
    reward: 1500,
    type: "milestone",
    difficulty: "hard",
    creator: { address: "0x1f87...6b29", initial: "M" },
    deadline: "Sep 20, 2026",
    orderId: "p8n3v7",
    milestones: [
      { title: "UI Component & Design", amount: 500 },
      { title: "Chain Integration", amount: 500 },
      { title: "Testing & Deployment", amount: 500 },
    ],
  },
  {
    id: "task-005",
    title: "Design Mobile App Wireframes for Wallet",
    description:
      "Create high-fidelity Figma wireframes for a mobile crypto wallet app supporting Quai Network. Deliverables: 20+ screens covering onboarding, send/receive, portfolio, and settings.",
    reward: 650,
    type: "bounty",
    difficulty: "medium",
    creator: { address: "0xa2e3...9d51", initial: "D" },
    deadline: "Sep 08, 2026",
    orderId: "t5q8w1",
    milestones: [],
  },
  {
    id: "task-006",
    title: "Implement Automated Testing Suite for Escrow Contracts",
    description:
      "Write comprehensive Hardhat test suite covering all escrow contract scenarios: deposits, milestone releases, disputes, timeouts, and edge cases. 95%+ coverage required.",
    reward: 900,
    type: "milestone",
    difficulty: "medium",
    creator: { address: "0x7c64...2a08", initial: "X" },
    deadline: "Sep 15, 2026",
    orderId: "r3y6m2",
    milestones: [
      { title: "Unit Tests & Setup", amount: 300 },
      { title: "Integration & E2E Tests", amount: 300 },
      { title: "Coverage Report & CI Setup", amount: 300 },
    ],
  },
  {
    id: "task-007",
    title: "Create Promotional Video for MoneePay Launch",
    description:
      "Produce a 60-90 second animated explainer video showcasing MoneePay's escrow flow, Farcaster integration, and Quai Network benefits. Script, storyboard, and final edit included.",
    reward: 750,
    type: "bounty",
    difficulty: "medium",
    creator: { address: "0xe512...7f33", initial: "L" },
    deadline: "Aug 28, 2026",
    orderId: "h9c4b6",
    milestones: [],
  },
  {
    id: "task-008",
    title: "Build Telegram Bot for Escrow Notifications",
    description:
      "Develop a Telegram bot that sends real-time notifications for escrow events: deposits, milestone approvals, disputes, and settlements. Must integrate with on-chain events via RPC.",
    reward: 450,
    type: "bounty",
    difficulty: "easy",
    creator: { address: "0x4b93...5e17", initial: "W" },
    deadline: "Sep 05, 2026",
    orderId: "j1k7n5",
    milestones: [],
  },
];

const FILTER_OPTIONS = ["All Tasks", "Active Bounties", "Milestone Projects"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "reward_high", label: "Highest Reward" },
  { value: "reward_low", label: "Lowest Reward" },
  { value: "deadline", label: "Expiring Soon" },
];

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Tasks");
  const [sortBy, setSortBy] = useState("newest");

  const filteredTasks = useMemo(() => {
    let results = MOCK_TASKS;

    // Type filter
    if (activeFilter === "Active Bounties") {
      results = results.filter((t) => t.type === "bounty");
    } else if (activeFilter === "Milestone Projects") {
      results = results.filter((t) => t.type === "milestone");
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "reward_high":
        results = [...results].sort((a, b) => b.reward - a.reward);
        break;
      case "reward_low":
        results = [...results].sort((a, b) => a.reward - b.reward);
        break;
      case "deadline":
        results = [...results].sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        );
        break;
      default:
        break;
    }

    return results;
  }, [searchQuery, activeFilter, sortBy]);

  const totalRewards = MOCK_TASKS.reduce((sum, t) => sum + t.reward, 0);
  const bountyCount = MOCK_TASKS.filter((t) => t.type === "bounty").length;
  const milestoneCount = MOCK_TASKS.filter((t) => t.type === "milestone").length;

  const getDifficultyClass = (diff) => {
    switch (diff) {
      case "easy": return styles.diffEasy;
      case "medium": return styles.diffMedium;
      case "hard": return styles.diffHard;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.topHeader}>
        <Link href="/dashboard" className={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        <div className={styles.headerBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span>Tasks & Rewards</span>
        </div>
      </header>

      <main className={styles.mainArea}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>🎯 Tasks & Rewards</h1>
          <p className={styles.pageSub}>
            Browse open bounties and milestone projects. Rewards are locked in smart contract escrow — complete the task, get paid guaranteed. No trust required.
          </p>
        </div>

        {/* Stats Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{MOCK_TASKS.length}</div>
            <div className={styles.statLabel}>Open Tasks</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalRewards.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Qi Rewards</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{bountyCount}</div>
            <div className={styles.statLabel}>Active Bounties</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{milestoneCount}</div>
            <div className={styles.statLabel}>Milestone Projects</div>
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
              id="tasks-search"
              type="text"
              className={styles.searchInput}
              placeholder="Search tasks, skills, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                className={`${styles.filterTab} ${activeFilter === filter ? styles.filterTabActive : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} available
          </span>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="tasks-sort"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        <div className={styles.tasksList}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No tasks match your search</h3>
              <p className={styles.emptyDesc}>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/order/${task.orderId}`}
                className={styles.taskCard}
                id={`task-${task.id}`}
              >
                {/* Header Row */}
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitleGroup}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    <div className={styles.taskBadges}>
                      <span className={`${styles.typeBadge} ${task.type === "milestone" ? styles.typeMilestone : styles.typeBounty}`}>
                        {task.type === "milestone" ? "🤝 Milestone" : "🎯 Bounty"}
                      </span>
                      <span className={`${styles.difficultyBadge} ${getDifficultyClass(task.difficulty)}`}>
                        {task.difficulty === "easy" ? "● Easy" : task.difficulty === "medium" ? "●● Medium" : "●●● Hard"}
                      </span>
                      <span className={styles.escrowLockBadge}>
                        <span className={styles.lockDot} />
                        Escrow Locked
                      </span>
                    </div>
                  </div>

                  {/* Reward Amount */}
                  <div className={styles.rewardTag}>
                    <span className={styles.rewardLabel}>Reward</span>
                    <span>
                      <span className={styles.rewardAmount}>{task.reward.toLocaleString()}</span>
                      <span className={styles.rewardCurrency}>Qi</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={styles.taskDesc}>{task.description}</p>

                {/* Milestone Preview (if applicable) */}
                {task.type === "milestone" && task.milestones.length > 0 && (
                  <div className={styles.milestonePreview}>
                    {task.milestones.map((ms, idx) => (
                      <span key={idx} className={styles.milestoneChip}>
                        <span className={styles.milestoneChipNum}>{idx + 1}</span>
                        <span>{ms.title}</span>
                        <span className={styles.milestoneChipAmount}>{ms.amount} Qi</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className={styles.taskFooter}>
                  <div className={styles.taskMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.creatorAvatar}>{task.creator.initial}</span>
                      <span className={styles.creatorAddr}>{task.creator.address}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <svg className={styles.metaIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Due: {task.deadline}</span>
                    </div>
                  </div>

                  <span className={styles.claimBtn}>
                    Apply & Claim
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
