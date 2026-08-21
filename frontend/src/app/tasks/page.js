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
    title: "Quai Cyprus-1 Subgraph Indexer & Analytics API",
    description: "Build an open-source indexer node on Quai Cyprus-1 with GraphQL API endpoints for real-time escrow analytics.",
    reward: 1500,
    type: "milestone",
    difficulty: "expert",
    creator: { address: "0x001c...3f47", initial: "Q" },
    deadline: "5 Days",
    status: "open",
    orderId: "a3kd82",
    contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
    milestones: [
      { title: "Phase 1: Architecture & Subgraph Manifest", amount: 600 },
      { title: "Phase 2: Live Indexing & GraphQL Endpoints", amount: 900 },
    ],
  },
  {
    id: "task-002",
    title: "Pelagus Wallet Mobile Extension Connector",
    description: "Implement mobile deep-linking for Pelagus wallet to authorize Quai Network escrow deposits on iOS & Android.",
    reward: 800,
    type: "bounty",
    difficulty: "medium",
    creator: { address: "0x0035...fbc6", initial: "P" },
    deadline: "3 Days",
    status: "open",
    orderId: "f7j2k9",
    contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
    milestones: [
      { title: "Single Bounty Deliverable", amount: 800 },
    ],
  },
  {
    id: "task-003",
    title: "ProductEscrow & MilestoneEscrow Gas Optimization Audit",
    description: "Perform comprehensive Yul/assembly gas optimization audit on MoneePay core escrow contracts.",
    reward: 2000,
    type: "milestone",
    difficulty: "expert",
    creator: { address: "0x000E...8fbA", initial: "S" },
    deadline: "7 Days",
    status: "open",
    orderId: "k2m9x4",
    contractAddress: CONTRACT_ADDRESSES.MilestoneEscrow,
    milestones: [
      { title: "Phase 1: Vulnerability & Assembly Review", amount: 800 },
      { title: "Phase 2: Gas Report & Benchmark Tests", amount: 1200 },
    ],
  },
];

export default function TasksPage() {
  const { tasks: onChainTasks, loading: onChainLoading } = useMilestoneEscrow();
  const { account, isConnected, connectWallet } = useWallet();
  const { createTask, loading: contractLoading } = useEscrowContracts();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("reward-high");

  // Local state for custom created tasks
  const [customTasks, setCustomTasks] = useState([]);

  // Create Task Modal State
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
      addToast({ message: "Please enter a task title.", type: "error" });
      return;
    }
    const rewardNum = parseFloat(formRewardQi);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      addToast({ message: "Please enter a valid reward deposit amount in Qi.", type: "error" });
      return;
    }
    if (!isPercentValid) {
      addToast({ message: `Milestone percentages must sum to 100% (Current sum: ${totalPercent}%).`, type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "Please connect your wallet to lock escrow on-chain.", type: "prompt" });
      connectWallet();
      return;
    }

    try {
      addToast({ message: "Awaiting wallet signature to create task escrow...", type: "prompt" });

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
        message: "Task Escrow created & locked on Quai Cyprus-1",
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
      addToast({ message: `Task Creation Failed: ${err.message}`, type: "error" });
    }
  };

  // Submit Application Form
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyProposal.trim()) {
      addToast({ message: "Please enter your proposal or execution approach.", type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "Please connect your wallet to submit your application.", type: "prompt" });
      connectWallet();
      return;
    }

    setIsSubmittingApply(true);

    const newApp = {
      id: `app-${Date.now()}`,
      taskId: selectedApplyTask.id || "task-001",
      taskTitle: selectedApplyTask.title || "Milestone Task",
      rewardQi: selectedApplyTask.reward || 500,
      type: selectedApplyTask.type || "milestone",
      creator: selectedApplyTask.creator?.address || "0x001c...3f47",
      proposal: applyProposal,
      timeline: applyTimeline,
      portfolio: applyPortfolio,
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Under Review",
      statusType: "review",
    };

    try {
      const existing = JSON.parse(localStorage.getItem("moneepay_my_applications") || "[]");
      localStorage.setItem("moneepay_my_applications", JSON.stringify([newApp, ...existing]));
    } catch (err) {
      console.warn("Failed to save application to localStorage:", err);
    }

    setTimeout(() => {
      setIsSubmittingApply(false);
      addToast({
        message: `Application submitted for "${selectedApplyTask.title}"! Track status under Dashboard > My Applications.`,
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
            <span className={styles.badgeLabel}>MILESTONE & BOUNTY ESCROW ENGINE</span>
            <h1 className={styles.title}>
              Task & Bounty <span className="gradient-text">Discovery Hub</span>
            </h1>
            <p className={styles.subtitle}>
              Earn Qi by building software, running audits, or completing task bounties on Quai Network. Escrows locked on-chain in <code>MilestoneEscrow.sol</code>.
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
            <div className={styles.statLabel}>Total Task Bounty Pool</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{allTasks.length} Active</div>
            <div className={styles.statLabel}>Open Bounties & Tasks</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{avgTaskReward.toLocaleString()} Qi</div>
            <div className={styles.statLabel}>Average Reward Per Task</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>100% Locked</div>
            <div className={styles.statLabel}>Escrow Security SLA</div>
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
              placeholder="Search tasks, bounties, security audits, or dev tools..."
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
              All Tasks
            </button>
            <button
              className={`${styles.filterTab} ${activeTab === "milestone" ? styles.filterTabActive : ""}`}
              onClick={() => setActiveTab("milestone")}
            >
              Milestone Escrows
            </button>
            <button
              className={`${styles.filterTab} ${activeTab === "bounty" ? styles.filterTabActive : ""}`}
              onClick={() => setActiveTab("bounty")}
            >
              Single Bounties
            </button>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            Showing <strong>{filteredTasks.length}</strong> of {allTasks.length} task bounties
          </span>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="reward-high">Reward: High to Low</option>
            <option value="reward-low">Reward: Low to High</option>
          </select>
        </div>

        {/* Indexing Indicator */}
        {onChainLoading && (
          <div className={styles.loadingBox}>
            <span>Indexing live MilestoneEscrow smart contract events on Quai Cyprus-1...</span>
          </div>
        )}

        {/* Tasks Grid */}
        <div className={styles.tasksGrid}>
          {filteredTasks.map((t) => (
            <div key={t.id} className={styles.taskCard}>
              <div className={styles.cardHeader}>
                <div className={styles.typeBadgeWrapper}>
                  <span className={styles.typeBadge}>
                    {t.type === "milestone" ? "Milestone Escrow" : "Single Bounty"}
                  </span>
                  <span className={`${styles.difficultyBadge} ${styles[t.difficulty]}`}>
                    {t.difficulty}
                  </span>
                </div>

                <div className={styles.rewardBox}>
                  <span className={styles.rewardValue}>{t.reward.toLocaleString()}</span>
                  <span className={styles.rewardCurrency}>Qi</span>
                </div>
              </div>

              <h3 className={styles.taskTitle}>{t.title}</h3>
              <p className={styles.taskDesc}>{t.description}</p>

              {/* Milestones Schedule */}
              <div className={styles.milestonesContainer}>
                <div className={styles.milestonesTitle}>Tranche Schedule</div>
                <div className={styles.trancheList}>
                  {t.milestones &&
                    t.milestones.map((m, idx) => (
                      <span key={idx} className={styles.tranchePill}>
                        M{idx + 1}: {m.amount.toLocaleString()} Qi
                      </span>
                    ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.creatorInfo}>
                  <span className={styles.creatorAvatar}>{t.creator.initial}</span>
                  <span className={styles.creatorAddr}>{t.creator.address}</span>
                </div>

                <div className={styles.ctaGroup}>
                  <FarcasterShareButton
                    text={`Check out this task bounty: "${t.title}" (${t.reward} Qi) on Quai Network!`}
                    buttonText="Share"
                  />
                  <button
                    className="btn btn-outlined btn-sm"
                    onClick={() => setSelectedApplyTask(t)}
                  >
                    View Task & Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No matching task bounties found</h3>
            <p>Try adjusting your search query or switching categories.</p>
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
              <span className={styles.modalBadge}>MilestoneEscrow.sol</span>
              <h2 className={styles.modalTitle}>Create Task Escrow</h2>
              <p className={styles.modalSub}>
                Deposit Qi collateral into smart contract. Payouts release to solver upon verified deliverable milestones.
              </p>
            </div>

            {/* Presets Bar */}
            <div className={styles.presetBar}>
              <span className={styles.presetLabel}>Quick Presets:</span>
              <button className={styles.presetBtn} onClick={() => applyPreset("single")}>
                Single Bounty (100%)
              </button>
              <button className={styles.presetBtn} onClick={() => applyPreset("two-phase")}>
                50% / 50% Two-Phase
              </button>
              <button className={styles.presetBtn} onClick={() => applyPreset("three-phase")}>
                40% / 30% / 30% Three-Phase
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Task Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Quai Subgraph Indexer Node"
                    className={styles.formInput}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup} style={{ width: "160px" }}>
                  <label className={styles.label}>Escrow Type</label>
                  <select
                    className={styles.formSelect}
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="milestone">Milestone Tranches</option>
                    <option value="bounty">Single Bounty Payout</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Description & Deliverables</label>
                <textarea
                  rows={3}
                  placeholder="Specify clear technical requirements, acceptance criteria, and repository links..."
                  className={styles.formTextarea}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Total Reward Deposit (Qi) *</label>
                  <div className={styles.currencyInputWrapper}>
                    <input
                      type="number"
                      min="1"
                      placeholder="500"
                      className={styles.formInput}
                      value={formRewardQi}
                      onChange={(e) => setFormRewardQi(e.target.value)}
                      required
                    />
                    <span className={styles.currencySuffix}>Qi</span>
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Difficulty Level</label>
                  <select
                    className={styles.formSelect}
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy (Bounty)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="expert">Expert (Audit/Core)</option>
                  </select>
                </div>
              </div>

              {/* Milestone Tranches Section */}
              <div className={styles.milestoneSection}>
                <div className={styles.milestoneHeader}>
                  <div>
                    <h4 className={styles.milestoneTitle}>Milestone Tranches Breakdown</h4>
                    <p className={styles.milestoneSub}>Percentages must sum to exactly 100%.</p>
                  </div>
                  <span className={`${styles.percentSumBadge} ${isPercentValid ? styles.percentValid : styles.percentInvalid}`}>
                    Total: {totalPercent}% / 100%
                  </span>
                </div>

                <div className={styles.milestoneList}>
                  {formMilestones.map((m, idx) => {
                    const milestoneQi = Math.round(((parseFloat(formRewardQi) || 0) * (m.percent || 0)) / 100);
                    return (
                      <div key={idx} className={styles.milestoneRow}>
                        <span className={styles.milestoneIndex}>M{idx + 1}</span>
                        <input
                          type="text"
                          placeholder={`Phase ${idx + 1} Title`}
                          className={styles.milestoneTitleInput}
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                          required
                        />
                        <div className={styles.percentInputWrapper}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className={styles.percentInput}
                            value={m.percent}
                            onChange={(e) => handleMilestoneChange(idx, "percent", e.target.value)}
                            required
                          />
                          <span className={styles.percentSymbol}>%</span>
                        </div>
                        <span className={styles.milestoneQiVal}>{milestoneQi.toLocaleString()} Qi</span>
                        {formMilestones.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeMilestoneBtn}
                            onClick={() => handleRemoveMilestone(idx)}
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
                  className={styles.addMilestoneBtn}
                  onClick={handleAddMilestone}
                >
                  + Add Tranche
                </button>
              </div>

              {/* Contract Verification Notice */}
              <div className={styles.contractNotice}>
                <div className={styles.noticeShieldIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.noticeTitle}>MilestoneEscrow.sol Verification</div>
                  <div className={styles.noticeText}>
                    Triggers <code>MilestoneEscrow.createTask(titles[], percents[])</code> on Quai Cyprus-1.
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
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
                  style={{ minWidth: "200px", justifyContent: "center" }}
                >
                  {contractLoading ? "Signing Escrow Deposit..." : `Deposit & Lock (${formRewardQi} Qi)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: VIEW TASK & APPLY FORM */}
      {selectedApplyTask && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplyTask(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedApplyTask(null)}>
              ✕
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.cardBadges} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <span className={styles.typeBadge} style={{ position: "static" }}>
                  {selectedApplyTask.type === "milestone" ? "Milestone Escrow" : "Single Bounty"}
                </span>
                <span className={`${styles.difficultyBadge} ${styles[selectedApplyTask.difficulty]}`} style={{ position: "static" }}>
                  {selectedApplyTask.difficulty}
                </span>
              </div>

              <h2 className={styles.modalTitle}>{selectedApplyTask.title}</h2>
              <p className={styles.modalSub}>
                Posted by <code style={{ color: "#00D4AA" }}>{selectedApplyTask.creator.address}</code> • Order ID: <code>{selectedApplyTask.orderId}</code>
              </p>
            </div>

            {/* Price Banner */}
            <div className={styles.productPriceBanner}>
              <div>
                <span className={styles.priceBannerLabel}>Total Locked Reward</span>
                <div className={styles.priceBannerValue}>{selectedApplyTask.reward.toLocaleString()} Qi</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={styles.priceBannerLabel}>Execution Timeline</span>
                <div className={styles.priceBannerSub}>{selectedApplyTask.deadline}</div>
              </div>
            </div>

            {/* Task Description */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Scope of Work & Deliverables</h4>
              <p className={styles.detailText}>{selectedApplyTask.description}</p>
            </div>

            {/* Tranche Breakdown */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Milestone Tranche Schedule</h4>
              <div className={styles.trancheDetailList}>
                {selectedApplyTask.milestones &&
                  selectedApplyTask.milestones.map((m, idx) => (
                    <div key={idx} className={styles.trancheDetailItem}>
                      <div>
                        <span className={styles.trancheNum}>M{idx + 1}</span>
                        <span className={styles.trancheText}>{m.title}</span>
                      </div>
                      <span className={styles.trancheAmount}>{m.amount.toLocaleString()} Qi</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Solver Application Submission Form */}
            <form onSubmit={handleApplySubmit} className={styles.applyFormContainer}>
              <h3 className={styles.applyFormTitle}>Submit Your Solver Application</h3>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Execution Proposal & Technical Approach *</label>
                <textarea
                  rows={4}
                  placeholder="Detail your experience, proposed architecture, milestone timeline, and acceptance criteria..."
                  className={styles.formTextarea}
                  value={applyProposal}
                  onChange={(e) => setApplyProposal(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formRow} style={{ marginTop: "16px" }}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Estimated Delivery Window</label>
                  <select
                    className={styles.formSelect}
                    value={applyTimeline}
                    onChange={(e) => setApplyTimeline(e.target.value)}
                  >
                    <option value="2 Days">2 Days (Fast SLA)</option>
                    <option value="3 Days">3 Days (Standard)</option>
                    <option value="5 Days">5 Days (Complex)</option>
                    <option value="7 Days">7 Days (Full Audit/Build)</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Portfolio / GitHub URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    className={styles.formInput}
                    value={applyPortfolio}
                    onChange={(e) => setApplyPortfolio(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalActions} style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn btn-outlined"
                  onClick={() => setSelectedApplyTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingApply}
                  style={{ minWidth: "220px", justifyContent: "center" }}
                >
                  {isSubmittingApply ? "Sending Application..." : `Apply for Task (${selectedApplyTask.reward.toLocaleString()} Qi)`}
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
