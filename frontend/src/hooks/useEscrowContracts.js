"use client";

import { useState, useCallback } from "react";
import { quais } from "quais";
import { useWallet } from "./useWallet";

import WQIArtifact from "@/abis/MockWQI.json";
import MilestoneEscrowArtifact from "@/abis/MilestoneEscrow.json";
import ProductEscrowArtifact from "@/abis/ProductEscrow.json";
import BatchPayrollArtifact from "@/abis/BatchPayroll.json";

export const CONTRACT_ADDRESSES = {
  WQI: "0x00354572C988dB5ca96827B091a59dAea71Bfbc6",
  MilestoneEscrow: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
  ProductEscrow: "0x0067f487e59f0C45922854F32B6d8deD8e820776",
  BatchPayroll: "0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB",
  Arbitrator: "0x007abf8E01568a43499A1Ec754D0eD218d7c4074",
};

export function useEscrowContracts() {
  const { account, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Helper to get signer contract instance
  const getSignerContract = useCallback(async (contractAddress, abi) => {
    if (typeof window === "undefined") throw new Error("Window not available");
    const pelagus = window.pelagus || window.ethereum;
    if (!pelagus) throw new Error("Pelagus wallet extension not installed.");
    const browserProvider = new quais.BrowserProvider(pelagus);
    const signer = await browserProvider.getSigner();
    return new quais.Contract(contractAddress, abi, signer);
  }, []);

  // ==========================================
  // ISSUE #25: MilestoneEscrow Methods
  // ==========================================

  const createTask = async ({ title, description, rewardQi, trancheBpsArray, milestoneTitles, milestonePercents }) => {
    setLoading(true);
    setError(null);
    try {
      const titles = milestoneTitles || (title ? [title] : ["Delivery Milestone"]);
      const percents = milestonePercents || (trancheBpsArray ? trancheBpsArray.map((b) => b / 100) : [100]);

      const sum = percents.reduce((acc, val) => acc + Number(val), 0);
      if (sum !== 100) {
        throw new Error(`Milestone percentage allocations must sum to 100%. Current sum: ${sum}%`);
      }

      const contract = await getSignerContract(CONTRACT_ADDRESSES.MilestoneEscrow, MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact);
      const valueWei = quais.parseEther(rewardQi.toString());

      const tx = await contract.createTask(titles, percents, { value: valueWei });
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("createTask error:", err);
      setError(err.message || "Failed to create task escrow");
      setLoading(false);
      throw err;
    }
  };

  const assignSolver = async (taskId, solverAddress) => {
    setLoading(true);
    setError(null);
    try {
      if (!quais.isAddress(solverAddress)) {
        throw new Error("Invalid solver wallet address.");
      }
      const contract = await getSignerContract(CONTRACT_ADDRESSES.MilestoneEscrow, MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact);
      const checksummed = quais.getAddress(solverAddress);
      const tx = await contract.assignSolver(taskId, checksummed);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("assignSolver error:", err);
      setError(err.message || "Failed to assign solver");
      setLoading(false);
      throw err;
    }
  };

  const approveMilestone = async (taskId, milestoneIndex) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.MilestoneEscrow, MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact);
      const tx = await contract.approveMilestone(taskId, milestoneIndex);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("approveMilestone error:", err);
      setError(err.message || "Failed to approve milestone");
      setLoading(false);
      throw err;
    }
  };

  const openTaskDispute = async (taskId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.MilestoneEscrow, MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact);
      const tx = await contract.openDispute(taskId, reason);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("openTaskDispute error:", err);
      setError(err.message || "Failed to open dispute");
      setLoading(false);
      throw err;
    }
  };

  const cancelTask = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.MilestoneEscrow, MilestoneEscrowArtifact.abi || MilestoneEscrowArtifact);
      const tx = await contract.cancelTask(taskId);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("cancelTask error:", err);
      setError(err.message || "Failed to cancel task");
      setLoading(false);
      throw err;
    }
  };

  // ==========================================
  // ISSUE #26: ProductEscrow Methods
  // ==========================================

  const createOrder = async ({ itemTitle, priceQi, deliveryDeadlineSeconds }) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.ProductEscrow, ProductEscrowArtifact.abi || ProductEscrowArtifact);
      const priceWei = quais.parseEther(priceQi.toString());

      const tx = await contract.createOrder(itemTitle, priceWei, deliveryDeadlineSeconds);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("createOrder error:", err);
      setError(err.message || "Failed to create product order");
      setLoading(false);
      throw err;
    }
  };

  const depositProductEscrow = async (orderId, priceQi) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.ProductEscrow, ProductEscrowArtifact.abi || ProductEscrowArtifact);
      const priceWei = quais.parseEther(priceQi.toString());

      const tx = await contract.depositEscrow(orderId, { value: priceWei });
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("depositProductEscrow error:", err);
      setError(err.message || "Failed to deposit product escrow");
      setLoading(false);
      throw err;
    }
  };

  const confirmDelivery = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.ProductEscrow, ProductEscrowArtifact.abi || ProductEscrowArtifact);
      const tx = await contract.confirmDelivery(orderId);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("confirmDelivery error:", err);
      setError(err.message || "Failed to confirm delivery");
      setLoading(false);
      throw err;
    }
  };

  const claimTimeout = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.ProductEscrow, ProductEscrowArtifact.abi || ProductEscrowArtifact);
      const tx = await contract.claimTimeout(orderId);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("claimTimeout error:", err);
      setError(err.message || "Failed to claim timeout");
      setLoading(false);
      throw err;
    }
  };

  const openProductDispute = async (orderId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.ProductEscrow, ProductEscrowArtifact.abi || ProductEscrowArtifact);
      const tx = await contract.openDispute(orderId, reason);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("openProductDispute error:", err);
      setError(err.message || "Failed to open product dispute");
      setLoading(false);
      throw err;
    }
  };

  // ==========================================
  // ISSUE #30: Dispute Resolution & Arbitration Methods
  // ==========================================

  const resolveDispute = async (escrowType, id, splitPercent) => {
    setLoading(true);
    setError(null);
    try {
      const contractAddress = escrowType === "product"
        ? CONTRACT_ADDRESSES.ProductEscrow
        : CONTRACT_ADDRESSES.MilestoneEscrow;
      const artifact = escrowType === "product"
        ? ProductEscrowArtifact
        : MilestoneEscrowArtifact;

      const contract = await getSignerContract(contractAddress, artifact.abi || artifact);
      const tx = contract.resolveDispute
        ? await contract.resolveDispute(id, splitPercent)
        : await contract.confirmDelivery(id);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("resolveDispute error:", err);
      setError(err.message || "Failed to resolve dispute");
      setLoading(false);
      throw err;
    }
  };

  const transferArbitrator = async (escrowType, newArbitratorAddress) => {
    setLoading(true);
    setError(null);
    try {
      const contractAddress = escrowType === "product"
        ? CONTRACT_ADDRESSES.ProductEscrow
        : CONTRACT_ADDRESSES.MilestoneEscrow;
      const artifact = escrowType === "product"
        ? ProductEscrowArtifact
        : MilestoneEscrowArtifact;

      const contract = await getSignerContract(contractAddress, artifact.abi || artifact);
      const checksummed = quais.getAddress(newArbitratorAddress);
      const tx = contract.transferArbitrator
        ? await contract.transferArbitrator(checksummed)
        : await contract.grantAdmin(checksummed);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("transferArbitrator error:", err);
      setError(err.message || "Failed to transfer arbitrator role");
      setLoading(false);
      throw err;
    }
  };

  // ==========================================
  // ISSUE #27: BatchPayroll Methods & CSV Parser
  // ==========================================

  const disburseBatch = async (recipients, amountsQi) => {
    setLoading(true);
    setError(null);
    try {
      if (recipients.length !== amountsQi.length) {
        throw new Error("Recipients count must match amounts count.");
      }

      const checksummedRecipients = recipients.map((r) => quais.getAddress(r.trim()));
      const amountsWei = amountsQi.map((a) => quais.parseEther(a.toString()));
      const totalWei = amountsWei.reduce((sum, val) => sum + val, 0n);

      const contract = await getSignerContract(CONTRACT_ADDRESSES.BatchPayroll, BatchPayrollArtifact.abi || BatchPayrollArtifact);
      const tx = await contract.disburseBatch(checksummedRecipients, amountsWei, { value: totalWei });
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("disburseBatch error:", err);
      setError(err.message || "Failed to disburse batch payroll");
      setLoading(false);
      throw err;
    }
  };

  const parsePayrollCSV = (csvContent) => {
    const lines = csvContent.split("\n").filter((l) => l.trim() !== "");
    const records = [];
    const errors = [];

    lines.forEach((line, index) => {
      if (index === 0 && (line.toLowerCase().includes("address") || line.toLowerCase().includes("wallet"))) {
        return;
      }
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length < 2) return;

      const [addr, amountStr] = parts;
      const isValid = quais.isAddress(addr);
      const amountNum = parseFloat(amountStr);

      if (!isValid) {
        errors.push(`Line ${index + 1}: Invalid Quai address '${addr}'`);
      } else if (isNaN(amountNum) || amountNum <= 0) {
        errors.push(`Line ${index + 1}: Invalid amount '${amountStr}'`);
      } else {
        records.push({
          address: quais.getAddress(addr),
          amount: amountNum,
        });
      }
    });

    return { records, errors };
  };

  const grantAdmin = async (adminAddress) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.BatchPayroll, BatchPayrollArtifact.abi || BatchPayrollArtifact);
      const tx = await contract.grantAdmin(quais.getAddress(adminAddress));
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("grantAdmin error:", err);
      setError(err.message || "Failed to grant admin");
      setLoading(false);
      throw err;
    }
  };

  const revokeAdmin = async (adminAddress) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSignerContract(CONTRACT_ADDRESSES.BatchPayroll, BatchPayrollArtifact.abi || BatchPayrollArtifact);
      const tx = await contract.revokeAdmin(quais.getAddress(adminAddress));
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      return tx.hash;
    } catch (err) {
      console.error("revokeAdmin error:", err);
      setError(err.message || "Failed to revoke admin");
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    txHash,
    error,
    // Issue #25
    createTask,
    assignSolver,
    approveMilestone,
    openTaskDispute,
    cancelTask,
    // Issue #26
    createOrder,
    depositProductEscrow,
    confirmDelivery,
    claimTimeout,
    openProductDispute,
    // Issue #30
    resolveDispute,
    transferArbitrator,
    // Issue #27
    disburseBatch,
    parsePayrollCSV,
    grantAdmin,
    revokeAdmin,
  };
}
