import { useWallet as useWeb3Wallet } from "@/context/Web3Context";

export function useWallet() {
  return useWeb3Wallet();
}
