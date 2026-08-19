"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { quais } from "quais";

const Web3Context = createContext(null);

export const MOCK_WQI_ADDRESS = "0x00354572C988dB5ca96827B091a59dAea71Bfbc6";
export const QUAI_CYPRUS1_CHAIN_ID = 15000;
export const QUAI_CYPRUS1_HEX_CHAIN_ID = "0x3a98";
export const QUAI_CYPRUS1_RPC_URL = "https://orchard.rpc.quai.network/cyprus1";

// WQI ERC-20 Minimal ABI
export const WQI_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({
    quai: "0.00",
    qi: "0.00",
    wqi: "0.00",
  });

  const isCorrectNetwork = chainId === QUAI_CYPRUS1_CHAIN_ID || chainId === QUAI_CYPRUS1_HEX_CHAIN_ID;

  // Get Pelagus provider from window
  const getPelagusProvider = () => {
    if (typeof window === "undefined") return null;
    return window.pelagus || window.ethereum || null;
  };

  // Helper to format truncated address
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Fetch balances for account
  const fetchBalances = useCallback(async (addr) => {
    if (!addr) return;
    try {
      let quaiFormatted = "0.00";
      const pelagus = getPelagusProvider();

      // 1. Try querying directly from connected browser wallet provider (instant & CORS-free)
      if (pelagus) {
        try {
          const hexBal = await pelagus.request({ method: "eth_getBalance", params: [addr, "latest"] });
          if (hexBal) {
            const bigBal = BigInt(hexBal);
            quaiFormatted = parseFloat(quais.formatEther(bigBal)).toFixed(2);
          }
        } catch (err) {
          console.warn("Wallet provider balance query error:", err);
        }
      }

      // 2. Fallback query via JsonRpcProvider if 0.00
      if (quaiFormatted === "0.00") {
        try {
          const rpcProvider = new quais.JsonRpcProvider(QUAI_CYPRUS1_RPC_URL, undefined, { usePathing: true });
          const quaiBalWei = await rpcProvider.getBalance(addr).catch(() => 0n);
          if (quaiBalWei > 0n) {
            quaiFormatted = parseFloat(quais.formatEther(quaiBalWei)).toFixed(2);
          }
        } catch (err) {
          console.warn("RPC provider balance query error:", err);
        }
      }

      // 3. Fetch WQI balance using MockWQI contract
      let wqiFormatted = "0.00";
      try {
        const rpcProvider = new quais.JsonRpcProvider(QUAI_CYPRUS1_RPC_URL, undefined, { usePathing: true });
        const wqiContract = new quais.Contract(MOCK_WQI_ADDRESS, WQI_ABI, rpcProvider);
        const wqiBalWei = await wqiContract.balanceOf(addr);
        wqiFormatted = parseFloat(quais.formatEther(wqiBalWei)).toFixed(2);
      } catch (err) {
        console.warn("Error fetching WQI balance:", err);
      }

      setBalances({
        quai: quaiFormatted,
        qi: quaiFormatted, // Native Qi mapping
        wqi: wqiFormatted,
      });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  }, []);

  // Switch network to Quai Cyprus-1
  const switchNetwork = async () => {
    const pelagus = getPelagusProvider();
    if (!pelagus) {
      setError("Pelagus Wallet extension not detected.");
      return false;
    }

    try {
      await pelagus.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: QUAI_CYPRUS1_HEX_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // Chain 15000 not added yet, add it
      if (switchError.code === 4902 || switchError.message?.includes("Unrecognized chain")) {
        try {
          await pelagus.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: QUAI_CYPRUS1_HEX_CHAIN_ID,
                chainName: "Quai Network Orchard Cyprus-1",
                rpcUrls: [QUAI_CYPRUS1_RPC_URL],
                nativeCurrency: {
                  name: "Quai",
                  symbol: "QUAI",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://orchard.quaiscan.io"],
              },
            ],
          });
          return true;
        } catch (addError) {
          setError("Failed to add Quai Cyprus-1 network to wallet.");
          return false;
        }
      }
      setError("Please switch your wallet network to Quai Cyprus-1 (Chain 15000).");
      return false;
    }
  };

  // Connect Pelagus wallet
  const connectWallet = async (walletType = "Pelagus Wallet") => {
    setIsConnecting(true);
    setError(null);

    const pelagus = getPelagusProvider();

    if (!pelagus) {
      setIsConnecting(false);
      setError("Pelagus Wallet extension is missing. Please install Pelagus from pelaguswallet.io to proceed.");
      return false;
    }

    try {
      const accounts = await pelagus.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized.");
      }

      const connectedAddr = accounts[0];
      setAccount(connectedAddr);
      setIsConnected(true);
      setIsConnecting(false);

      const currentChain = await pelagus.request({ method: "eth_chainId" });
      const parsedChainId = typeof currentChain === "string" ? parseInt(currentChain, 16) : currentChain;
      setChainId(parsedChainId);

      if (parsedChainId !== QUAI_CYPRUS1_CHAIN_ID && currentChain !== QUAI_CYPRUS1_HEX_CHAIN_ID) {
        await switchNetwork();
      }

      await fetchBalances(connectedAddr);
      return true;
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet.");
      setIsConnecting(false);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setError(null);
    setBalances({ quai: "0.00", qi: "0.00", wqi: "0.00" });
  };

  // 1-Click Auto-Wrap Qi -> WQI Helper
  const wrapQi = async (amountInEther) => {
    const pelagus = getPelagusProvider();
    if (!pelagus || !account) {
      throw new Error("Wallet not connected.");
    }

    try {
      const browserProvider = new quais.BrowserProvider(pelagus);
      const signer = await browserProvider.getSigner();
      const wqiContract = new quais.Contract(MOCK_WQI_ADDRESS, WQI_ABI, signer);

      const valueWei = quais.parseEther(amountInEther.toString());
      const tx = await wqiContract.deposit({ value: valueWei });
      await tx.wait();

      await fetchBalances(account);
      return tx.hash;
    } catch (err) {
      console.error("Error wrapping Qi to WQI:", err);
      throw err;
    }
  };

  // Listen to account and chain change events
  useEffect(() => {
    const pelagus = getPelagusProvider();
    if (!pelagus) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        fetchBalances(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (newChainId) => {
      const parsed = typeof newChainId === "string" ? parseInt(newChainId, 16) : newChainId;
      setChainId(parsed);
      if (account) fetchBalances(account);
    };

    if (pelagus.on) {
      pelagus.on("accountsChanged", handleAccountsChanged);
      pelagus.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (pelagus.removeListener) {
        pelagus.removeListener("accountsChanged", handleAccountsChanged);
        pelagus.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, fetchBalances]);

  // Periodically refresh balances
  useEffect(() => {
    if (!account) return;
    const interval = setInterval(() => fetchBalances(account), 10000);
    return () => clearInterval(interval);
  }, [account, fetchBalances]);

  return (
    <Web3Context.Provider
      value={{
        account,
        truncatedAddress: formatAddress(account),
        isConnected,
        isConnecting,
        chainId,
        isCorrectNetwork,
        balances,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        fetchBalances,
        wrapQi,
        hasPelagus: !!getPelagusProvider(),
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWallet() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWallet must be used within a Web3Provider");
  }
  return context;
}
