"use client";

import { useState, useEffect, useCallback } from "react";
import { quais } from "quais";
import { QUAI_CYPRUS1_RPC_URL } from "@/context/Web3Context";
import { CONTRACT_ADDRESSES } from "./useEscrowContracts";
import MilestoneEscrowArtifact from "@/abis/MilestoneEscrow.json";

export function useMilestoneEscrow() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const rpcProvider = new quais.JsonRpcProvider(QUAI_CYPRUS1_RPC_URL, undefined, { usePathing: true });
      const contract = new quais.Contract(
        CONTRACT_ADDRESSES.MilestoneEscrow,
        MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact,
        rpcProvider
      );

      // Query TaskCreated events
      const filter = contract.filters.TaskCreated ? contract.filters.TaskCreated() : "*";
      const events = await contract.queryFilter(filter, -50000).catch(() => []);

      const parsedTasks = events.map((evt, idx) => {
        const args = evt.args || [];
        return {
          id: args.taskId || `task-${idx + 1}`,
          title: args.title || `Milestone Task #${idx + 1}`,
          description: args.description || "On-chain milestone bounty task",
          reward: args.totalReward ? parseFloat(quais.formatEther(args.totalReward)) : 500,
          type: "milestone",
          difficulty: "medium",
          creator: { address: args.creator ? `${args.creator.slice(0, 6)}...${args.creator.slice(-4)}` : "0x007a...c4074", initial: "M" },
          deadline: "On-Chain Active",
          orderId: args.taskId ? args.taskId.slice(0, 6) : `task-${idx}`,
          milestones: [
            { title: "Tranche Phase 1", amount: args.totalReward ? parseFloat(quais.formatEther(args.totalReward)) * 0.4 : 200 },
            { title: "Tranche Phase 2", amount: args.totalReward ? parseFloat(quais.formatEther(args.totalReward)) * 0.6 : 300 },
          ],
        };
      });

      setTasks(parsedTasks);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.warn("fetchTasks error:", err);
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 15000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return { tasks, taskCount: tasks.length, loading, error, refetch: fetchTasks };
}
