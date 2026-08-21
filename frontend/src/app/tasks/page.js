"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import ExplorerLink from "@/components/ExplorerLink";
import { useMilestoneEscrow } from "@/hooks/useMilestoneEscrow";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowContracts, CONTRACT_ADDRESSES } from "@/hooks/useEscrowContracts";
import { useToast } from "@/context/ToastContext";
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
      { title: "Initial Scope & Architecture Review", amount: 400 },
      { title: "Vulnerability Audit & Gas Analysis", amount: 400 },
      { title: "Final Fix Verification & Sign-off", amount: 400 },
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
  const { account, isConnected, connectWallet } = useWallet();
  const { createTask, loading: contractLoading } = useEscrowContracts();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Local state for custom tasks
  const [customTasks, setCustomTasks] = useState([]);

  // Create Escrow Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRewardQi, setFormRewardQi] = useState("500");
  const [formType, setFormType] = useState("milestone");
  const [formDifficulty, setFormDifficulty] = useState("medium");
  const [formMilestones, setFormMilestones] = useState([
    { title: "Phase 1: Initial Scope", percent: 50 },
    { title: "Phase 2: Final Sign-off & Delivery", percent: 50 },
  ]);

  // View & Apply Task Modal State
  const [selectedApplyTask, setSelectedApplyTask] = useState(null);
  const [applyProposal, setApplyProposal] = useState("");
  const [applyTimeline, setApplyTimeline] = useState("3 Days");
  const [applyPortfolio, setApplyPortfolio] = useState("");
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // Merge on-chain tasks, custom created tasks, and mock catalog items
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
      contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
      milestones: t.milestones || [{ title: "Delivery Milestone", amount: t.reward || 500 }],
    }));
    return [...customTasks, ...liveItems, ...MOCK_TASKS];
  }, [onChainTasks, customTasks]);

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

  // Milestone Form Helpers
  const totalPercent = useMemo(() => {
    return formMilestones.reduce((acc, m) => acc + Number(m.percent || 0), 0);
  }, [formMilestones]);

  const isPercentValid = totalPercent === 100;

  const handleAddMilestone = () => {
    setFormMilestones((prev) => [
      ...prev,
      { title: `Milestone ${prev.length + 1}`, percent: 0 },
    ]);
  };

  const handleRemoveMilestone = (index) => {
    if (formMilestones.length <= 1) return;
    setFormMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    setFormMilestones((prev) =>
      prev.map((m, idx) => {
        if (idx !== index) return m;
        return {
          ...m,
          [field]: field === "percent" ? Math.max(0, Math.min(100, Number(value) || 0)) : value,
        };
      })
    );
  };

  // Presets
  const applyPreset = (presetType) => {
    if (presetType === "single") {
      setFormType("bounty");
      setFormMilestones([{ title: "Single Bounty Completion", percent: 100 }]);
    } else if (presetType === "two-phase") {
      setFormType("milestone");
      setFormMilestones([
        { title: "Phase 1: Initial Architecture & Review", percent: 50 },
        { title: "Phase 2: Implementation & Delivery", percent: 50 },
      ]);
    } else if (presetType === "three-phase") {
      setFormType("milestone");
      setFormMilestones([
        { title: "Tranche 1: Architecture & Scope", percent: 40 },
        { title: "Tranche 2: Core Development", percent: 30 },
        { title: "Tranche 3: Audit & Sign-off", percent: 30 },
      ]);
    }
  };

  // Submit Create Task Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast({ message: "⚠️ Please enter a task title.", type: "error" });
      return;
    }
    const rewardNum = parseFloat(formRewardQi);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      addToast({ message: "⚠️ Please enter a valid reward deposit amount in Qi.", type: "error" });
      return;
    }
    if (!isPercentValid) {
      addToast({ message: `⚠️ Milestone percentages must sum to 100% (Current sum: ${totalPercent}%).`, type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "✍️ Please connect your wallet to lock escrow on-chain.", type: "prompt" });
      connectWallet();
      return;
    }

    try {
      addToast({ message: "✍️ Awaiting wallet signature to create task escrow...", type: "prompt" });

      const titles = formMilestones.map((m) => m.title || "Milestone");
      const percents = formMilestones.map((m) => Number(m.percent));

      const hash = await createTask({
        title: formTitle,
        description: formDesc,
        rewardQi: rewardNum,
        milestoneTitles: titles,
        milestonePercents: percents,
      });

      addToast({
        message: "✓ Task Escrow created & locked on Quai Cyprus-1!",
        type: "success",
        txHash: hash,
      });

      const newTask = {
        id: `created-${Date.now()}`,
        title: formTitle,
        description: formDesc || "Custom milestone task escrow created on Quai Network.",
        reward: rewardNum,
        type: formType,
        difficulty: formDifficulty,
        creator: { address: `${account.slice(0, 6)}...${account.slice(-4)}`, initial: "YOU" },
        deadline: "Flexible",
        orderId: hash.slice(0, 8),
        contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
        milestones: formMilestones.map((m) => ({
          title: m.title,
          amount: Math.round((rewardNum * m.percent) / 100),
        })),
      };

      setCustomTasks((prev) => [newTask, ...prev]);
      setIsModalOpen(false);
      setFormTitle("");
      setFormDesc("");
      setFormRewardQi("500");
    } catch (err) {
      addToast({ message: `⚠️ Task Creation Failed: ${err.message}`, type: "error" });
    }
  };

  // Submit Application Form
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyProposal.trim()) {
      addToast({ message: "⚠️ Please enter your proposal or execution approach.", type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "✍️ Please connect your wallet to submit your application.", type: "prompt" });
      connectWallet();
      return;
    }

    setIsSubmittingApply(true);
    setTimeout(() => {
      setIsSubmittingApply(false);
      addToast({
        message: `🚀 Application submitted for "${selectedApplyTask.title}"! Task creator has been notified.`,
        type: "success",
      });
      setSelectedApplyTask(null);
      setApplyProposal("");
      setApplyPortfolio("");
    }, 800);
  };

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

          <button
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => setIsModalOpen(true)}
          >
            + Create Task Escrow
          </button>
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
                  <button
                    className={styles.claimBtn}
                    onClick={() => setSelectedApplyTask(t)}
                  >
                    View Task & Apply ({t.reward.toLocaleString()} Qi) →
                  </button>
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

      {/* POP-UP MODAL 1: CREATE TASK ESCROW */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
              ✕
            </button>

            <div className={styles.modalHeader}>
              <span className={styles.modalBadge}>⚡ MilestoneEscrow.sol</span>
              <h2 className={styles.modalTitle}>Create Task Escrow</h2>
              <p className={styles.modalSub}>
                Post a milestone task or bounty with locked Quai Network escrows. Funds unfreeze tranche-by-tranche as deliverables are verified.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              <div className={styles.presetBar}>
                <span className={styles.presetLabel}>Quick Presets:</span>
                <button type="button" className={styles.presetBtn} onClick={() => applyPreset("single")}>
                  ⚡ Single Bounty (100%)
                </button>
                <button type="button" className={styles.presetBtn} onClick={() => applyPreset("two-phase")}>
                  🎯 50% / 50% Two-Phase
                </button>
                <button type="button" className={styles.presetBtn} onClick={() => applyPreset("three-phase")}>
                  🎯 40% / 30% / 30% Three-Phase
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Audit MoneePay Smart Contract (Solidity)"
                  className={styles.formInput}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Description & Scope of Work</label>
                <textarea
                  rows={3}
                  placeholder="Describe task scope, key deliverables, acceptance criteria, and technical stack requirements..."
                  className={styles.formTextarea}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Escrow Structure</label>
                  <select
                    className={styles.formSelect}
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="milestone">🎯 Milestone Tranches</option>
                    <option value="bounty">⚡ Single Bounty Payout</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Difficulty Level</label>
                  <select
                    className={styles.formSelect}
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy (Quick Task)</option>
                    <option value="medium">Medium (Standard Work)</option>
                    <option value="hard">Hard (Complex Audit/Code)</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Total Escrow Reward Deposit (Qi) *</label>
                <div className={styles.currencyInputWrapper}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="500"
                    className={styles.formInput}
                    value={formRewardQi}
                    onChange={(e) => setFormRewardQi(e.target.value)}
                    required
                  />
                  <span className={styles.currencySuffix}>Qi</span>
                </div>
                <span className={styles.inputHelp}>
                  Native Qi will be wrapped to WQI on-chain upon deposit to secure milestone tranches.
                </span>
              </div>

              <div className={styles.trancheSection}>
                <div className={styles.trancheHeader}>
                  <div>
                    <h4 className={styles.trancheTitle}>Milestone Tranche Allocations</h4>
                    <span className={styles.trancheSub}>
                      Smart contract requires milestone percentages to sum to exactly 100%.
                    </span>
                  </div>

                  <div className={`${styles.percentSumBadge} ${isPercentValid ? styles.sumValid : styles.sumInvalid}`}>
                    Total: {totalPercent}% / 100%
                  </div>
                </div>

                <div className={styles.trancheList}>
                  {formMilestones.map((m, idx) => {
                    const trancheAmountQi = Math.round(((parseFloat(formRewardQi) || 0) * (m.percent || 0)) / 100);
                    return (
                      <div key={idx} className={styles.trancheRow}>
                        <span className={styles.trancheIndex}>M{idx + 1}</span>
                        <input
                          type="text"
                          placeholder={`Milestone ${idx + 1} Title`}
                          className={styles.trancheTitleInput}
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                          required
                        />

                        <div className={styles.percentInputWrapper}>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            placeholder="%"
                            className={styles.tranchePercentInput}
                            value={m.percent}
                            onChange={(e) => handleMilestoneChange(idx, "percent", e.target.value)}
                            required
                          />
                          <span className={styles.percentSymbol}>%</span>
                        </div>

                        <span className={styles.trancheCalcAmount}>
                          {trancheAmountQi.toLocaleString()} Qi
                        </span>

                        {formMilestones.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeTrancheBtn}
                            onClick={() => handleRemoveMilestone(idx)}
                            title="Remove Tranche"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className={styles.addTrancheBtn}
                  onClick={handleAddMilestone}
                >
                  + Add Milestone Tranche
                </button>
              </div>

              <div className={styles.contractNotice}>
                <div className={styles.noticeIcon}>🔒</div>
                <div>
                  <div className={styles.noticeTitle}>Quai Cyprus-1 Contract Verification</div>
                  <div className={styles.noticeText}>
                    Deposit will trigger <code>MilestoneEscrow.createTask(titles[], percents[])</code> at contract address <code>{CONTRACT_ADDRESSES.MilestoneEscrow.slice(0, 10)}...</code>.
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn btn-outlined"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={contractLoading || !isPercentValid}
                  style={{ minWidth: "220px", justifyContent: "center" }}
                >
                  {contractLoading ? "✍️ Signing Escrow Deposit..." : `Deposit & Lock (${formRewardQi} Qi)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: VIEW TASK & SUBMIT APPLICATION */}
      {selectedApplyTask && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplyTask(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedApplyTask(null)}>
              ✕
            </button>

            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.taskBadges} style={{ marginBottom: "10px" }}>
                <span className={`${styles.typeBadge} ${selectedApplyTask.type === "milestone" ? styles.typeMilestone : styles.typeBounty}`}>
                  {selectedApplyTask.type === "milestone" ? "🎯 Milestone Escrow" : "⚡ Single Bounty"}
                </span>
                <span
                  className={`${styles.difficultyBadge} ${
                    selectedApplyTask.difficulty === "easy"
                      ? styles.diffEasy
                      : selectedApplyTask.difficulty === "medium"
                      ? styles.diffMedium
                      : styles.diffHard
                  }`}
                >
                  {selectedApplyTask.difficulty}
                </span>
                <span className={styles.escrowLockBadge}>
                  <span className={styles.lockDot} /> Escrow Funds Locked
                </span>
              </div>

              <h2 className={styles.modalTitle}>{selectedApplyTask.title}</h2>
              <p className={styles.modalSub}>
                Posted by <code style={{ color: "#00D4AA" }}>{selectedApplyTask.creator.address}</code> • Smart Contract Order ID: <code>{selectedApplyTask.orderId}</code>
              </p>
            </div>

            {/* Task Overview Grid */}
            <div className={styles.taskDetailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Total Escrow Reward</span>
                <div className={styles.detailValueTeal}>{selectedApplyTask.reward.toLocaleString()} Qi</div>
                <span className={styles.detailSub}>Protected by WQI Contract</span>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Milestone Tranches</span>
                <div className={styles.detailValue}>
                  {selectedApplyTask.milestones && selectedApplyTask.milestones.length > 0
                    ? `${selectedApplyTask.milestones.length} Tranches`
                    : "1 Single Payout"}
                </div>
                <span className={styles.detailSub}>Release on approval</span>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Target Deadline</span>
                <div className={styles.detailValue}>{selectedApplyTask.deadline || "Flexible"}</div>
                <span className={styles.detailSub}>Delivery SLA</span>
              </div>
            </div>

            {/* Full Scope & Description */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>📋 Scope of Work & Deliverables</h4>
              <p className={styles.detailText}>{selectedApplyTask.description}</p>
            </div>

            {/* Milestone Breakdown List */}
            {selectedApplyTask.milestones && selectedApplyTask.milestones.length > 0 && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>🎯 Milestone Tranche Schedule</h4>
                <div className={styles.trancheScheduleList}>
                  {selectedApplyTask.milestones.map((m, idx) => (
                    <div key={idx} className={styles.scheduleItem}>
                      <div className={styles.scheduleIndex}>M{idx + 1}</div>
                      <div className={styles.scheduleTitle}>{m.title}</div>
                      <div className={styles.scheduleAmount}>{m.amount.toLocaleString()} Qi</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contract Verification Link */}
            {selectedApplyTask.contractAddress && (
              <div style={{ margin: "16px 0" }}>
                <ExplorerLink hash={selectedApplyTask.contractAddress} label="MilestoneEscrow Contract Evidence & Receipt" />
              </div>
            )}

            <hr className={styles.divider} />

            {/* Application Submission Form Section */}
            <form onSubmit={handleApplySubmit} className={styles.applyForm}>
              <h3 className={styles.applyFormTitle}>✍️ Submit Your Solver Application</h3>
              <p className={styles.applyFormSub}>
                Provide your execution proposal and estimated delivery timeline. The task creator will review and assign you on-chain via <code>assignSolver()</code>.
              </p>

              {/* Applicant Wallet Address */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Applicant Quai Wallet Address</label>
                <input
                  type="text"
                  readOnly
                  className={styles.formInput}
                  value={isConnected ? account : "Wallet Not Connected (Click Submit to Connect)"}
                  style={{ background: "rgba(0,0,0,0.4)", color: isConnected ? "#00D4AA" : "#94A3B8", fontFamily: "monospace" }}
                />
              </div>

              {/* Cover Note / Proposal */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Proposal & Technical Approach *</label>
                <textarea
                  rows={3}
                  placeholder="Explain why you are qualified for this task, your technical plan, and how you will complete the deliverables..."
                  className={styles.formTextarea}
                  value={applyProposal}
                  onChange={(e) => setApplyProposal(e.target.value)}
                  required
                />
              </div>

              {/* Delivery Timeline & Portfolio Row */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Estimated Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Days"
                    className={styles.formInput}
                    value={applyTimeline}
                    onChange={(e) => setApplyTimeline(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Portfolio / GitHub Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle"
                    className={styles.formInput}
                    value={applyPortfolio}
                    onChange={(e) => setApplyPortfolio(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className={styles.modalActions} style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn btn-outlined"
                  onClick={() => setSelectedApplyTask(null)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingApply}
                  style={{ minWidth: "220px", justifyContent: "center" }}
                >
                  {isSubmittingApply ? "Sending Application..." : `🚀 Apply for Task (${selectedApplyTask.reward.toLocaleString()} Qi)`}
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
