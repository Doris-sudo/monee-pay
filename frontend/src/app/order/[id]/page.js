"use client";

import { useState, use } from "react";
import Link from "next/link";
import styles from "./OrderCheckout.module.css";

export default function OrderCheckout({ params }) {
  // Unwrap params using React.use() or default fallback
  const resolvedParams = params ? use(params) : { id: "82hd91" };
  const orderId = resolvedParams.id || "82hd91";

  // Mock order details based on ID
  const order = {
    id: orderId,
    title: "MacBook Pro M4 (16-inch, 36GB Unified Memory)",
    seller: "Bob's Electronics",
    sellerVerified: true,
    price: 500,
    currency: "Qi",
    deliveryDays: 7,
    escrowDuration: "7 Days after delivery",
    protectionType: "Full Buyer Escrow Protection",
    imageUrl: "/file.svg",
  };

  // State management: 'idle' | 'wallet_connecting' | 'connected' | 'processing' | 'success'
  const [payState, setPayState] = useState("connected");
  const [processingStep, setProcessingStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState("0x7e83...4a2c");
  const [txHash, setTxHash] = useState("");

  const handleConnectWallet = () => {
    setPayState("wallet_connecting");
    setTimeout(() => {
      setWalletAddress("0x7e83...4a2c");
      setPayState("connected");
    }, 800);
  };

  const handleExecuteEscrowPayment = () => {
    setPayState("processing");
    setProcessingStep(1);

    // Simulate multi-step WQI wrapping & escrow locking
    setTimeout(() => setProcessingStep(2), 1200);
    setTimeout(() => setProcessingStep(3), 2400);
    setTimeout(() => {
      setTxHash("0x9a8f...3c12");
      setPayState("success");
    }, 3600);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundGlow} />

      {/* Header */}
      <header className={styles.checkoutHeader}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00D4AA" strokeWidth="2"/>
              <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#00D4AA"/>
            </svg>
          </div>
          <span className={styles.brandName}>Monee<span style={{ color: "#00D4AA" }}>Pay</span></span>
        </Link>

        <div className={styles.shieldBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <span>Protected Escrow Checkout</span>
        </div>
      </header>

      {/* Main Checkout Card */}
      <main className={styles.mainContent}>
        <div className={`${styles.checkoutCard} glass-card`}>

          {payState === "success" ? (
            /* SUCCESS STATE */
            <div className={styles.successState}>
              <div className={styles.successIconWrapper}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className={styles.successTitle}>Payment Locked in Escrow!</h2>
              <p className={styles.successMessage}>
                Your payment of <strong style={{ color: "#00D4AA" }}>{order.price} Qi</strong> has been wrapped into WQI and secured in the escrow contract.
              </p>

              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span>Order ID:</span>
                  <strong>#{order.id}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Transaction Hash:</span>
                  <span className={styles.hashText}>{txHash}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Escrow Status:</span>
                  <span className={styles.fundedBadge}>Funded & Locked</span>
                </div>
              </div>

              <div className={styles.nextSteps}>
                <p>📦 <strong>What happens next?</strong></p>
                <p>The seller ({order.seller}) has been notified to ship your item. Funds remain locked until you confirm receipt.</p>
              </div>

              <Link href="/" className="btn btn-primary" style={{ width: "100%", marginTop: "20px" }}>
                Return to MoneePay
              </Link>
            </div>

          ) : payState === "processing" ? (
            /* PROCESSING STATE */
            <div className={styles.processingState}>
              <div className={styles.spinner} />
              <h3 className={styles.processingTitle}>Processing Escrow Deposit</h3>
              <p className={styles.processingSub}>Please confirm transaction in Pelagus Wallet</p>

              <div className={styles.stepProgress}>
                <div className={`${styles.stepItem} ${processingStep >= 1 ? styles.stepDone : ""}`}>
                  <span className={styles.stepDot}>{processingStep > 1 ? "✓" : "1"}</span>
                  <span>Approving Qi transfer</span>
                </div>
                <div className={`${styles.stepItem} ${processingStep >= 2 ? styles.stepDone : ""}`}>
                  <span className={styles.stepDot}>{processingStep > 2 ? "✓" : "2"}</span>
                  <span>Wrapping Qi to WQI on EVM Ledger</span>
                </div>
                <div className={`${styles.stepItem} ${processingStep >= 3 ? styles.stepDone : ""}`}>
                  <span className={styles.stepDot}>{processingStep >= 3 ? "✓" : "3"}</span>
                  <span>Locking WQI into Smart Contract Escrow</span>
                </div>
              </div>
            </div>

          ) : (
            /* DEFAULT / CONNECTED STATE */
            <>
              {/* Product Info Header */}
              <div className={styles.productHeader}>
                <div className={styles.productIconBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div className={styles.productDetails}>
                  <h1 className={styles.productTitle}>{order.title}</h1>
                  <div className={styles.sellerRow}>
                    <span>Seller: <strong>{order.seller}</strong></span>
                    {order.sellerVerified && (
                      <span className={styles.verifiedTag}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#00D4AA">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Banner */}
              <div className={styles.priceBanner}>
                <span className={styles.priceLabel}>Amount Due</span>
                <div className={styles.priceValue}>
                  <span className={styles.amount}>{order.price}</span>
                  <span className={styles.currency}>{order.currency}</span>
                </div>
                <span className={styles.wrappedNote}>Wrapped to 500 WQI in Escrow</span>
              </div>

              {/* Protection Details Grid */}
              <div className={styles.protectionGrid}>
                <div className={styles.protectionItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <div>
                    <span className={styles.gridLabel}>Estimated Delivery</span>
                    <span className={styles.gridValue}>{order.deliveryDays} Days</span>
                  </div>
                </div>

                <div className={styles.protectionItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <div>
                    <span className={styles.gridLabel}>Escrow Protection</span>
                    <span className={styles.gridValue}>Funds locked until delivery</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className={styles.breakdownBox}>
                <div className={styles.breakdownRow}>
                  <span>Item Subtotal</span>
                  <span>{order.price} Qi</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Platform Fee (0%)</span>
                  <span style={{ color: "#00D4AA" }}>0 Qi</span>
                </div>
                <div className={styles.divider} />
                <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                  <span>Total Amount</span>
                  <span className={styles.totalAmount}>{order.price} Qi</span>
                </div>
              </div>

              {/* Wallet & Payment Action */}
              <div className={styles.actionContainer}>
                {payState === "idle" ? (
                  <button 
                    className="btn btn-outlined" 
                    onClick={handleConnectWallet}
                    style={{ width: "100%" }}
                  >
                    Connect Pelagus Wallet to Pay
                  </button>
                ) : (
                  <>
                    <div className={styles.walletConnectedRow}>
                      <span className={styles.greenDot} />
                      <span>Connected: <strong>{walletAddress}</strong></span>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={handleExecuteEscrowPayment}
                      style={{ width: "100%", padding: "16px" }}
                      id="pay-and-escrow-btn"
                    >
                      <span>Pay & Escrow {order.price} Qi</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer info */}
        <p className={styles.footerNote}>
          Powered by Quai Network • Funds secured by smart contract • Order ID: #{order.id}
        </p>
      </main>
    </div>
  );
}
