"use client";

import { useState, useEffect, useCallback } from "react";
import { quais } from "quais";
import { QUAI_CYPRUS1_RPC_URL } from "@/context/Web3Context";

export function useContractRead({ address, abi, functionName, args = [], enabled = true, refreshInterval = 12000 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeRead = useCallback(async () => {
    if (!address || !abi || !functionName || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rpcProvider = new quais.JsonRpcProvider(QUAI_CYPRUS1_RPC_URL, undefined, { usePathing: true });
      const contract = new quais.Contract(address, abi, rpcProvider);

      const result = await contract[functionName](...args);
      setData(result);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.warn(`useContractRead error [${functionName}]:`, err);
      setError(err);
      setLoading(false);
    }
  }, [address, abi, functionName, JSON.stringify(args), enabled]);

  useEffect(() => {
    executeRead();

    if (refreshInterval > 0) {
      const interval = setInterval(executeRead, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [executeRead, refreshInterval]);

  return { data, loading, error, refetch: executeRead };
}
