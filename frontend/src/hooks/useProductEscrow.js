"use client";

import { useState, useEffect, useCallback } from "react";
import { quais } from "quais";
import { QUAI_CYPRUS1_RPC_URL } from "@/context/Web3Context";
import { CONTRACT_ADDRESSES } from "./useEscrowContracts";
import ProductEscrowArtifact from "@/abis/ProductEscrow.json";

export function useProductEscrow() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const rpcProvider = new quais.JsonRpcProvider(QUAI_CYPRUS1_RPC_URL, undefined, { usePathing: true });
      const contract = new quais.Contract(
        CONTRACT_ADDRESSES.ProductEscrow,
        ProductEscrowArtifact.abi || ProductEscrowArtifact,
        rpcProvider
      );

      // Query OrderCreated events
      const filter = contract.filters.OrderCreated ? contract.filters.OrderCreated() : "*";
      const events = await contract.queryFilter(filter, -50000).catch(() => []);

      const parsedOrders = events.map((evt, idx) => {
        const args = evt.args || [];
        return {
          id: args.orderId || `ord-${idx + 1}`,
          title: args.itemTitle || `Product Item #${idx + 1}`,
          priceQi: args.price ? parseFloat(quais.formatEther(args.price)) : 300,
          seller: args.seller ? `${args.seller.slice(0, 6)}...${args.seller.slice(-4)}` : "0x007a...c4074",
          deliveryDeadline: args.deliveryDeadline ? Number(args.deliveryDeadline) : Math.floor(Date.now() / 1000) + 86400 * 3,
          status: "active",
        };
      });

      setOrders(parsedOrders);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.warn("fetchOrders error:", err);
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, orderCount: orders.length, loading, error, refetch: fetchOrders };
}
