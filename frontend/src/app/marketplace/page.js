"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import styles from "./Marketplace.module.css";

const MOCK_PRODUCTS = [
  {
    id: "mp-001",
    title: "MacBook Pro 16\" M4 Max",
    description: "Brand new in sealed box. 48GB RAM, 1TB SSD. Ships internationally with tracking & insurance.",
    price: 2400,
    category: "Electronics",
    emoji: "💻",
    seller: { address: "0x3b91...8f12", initial: "B" },
    deadline: "Aug 28, 2026",
    status: "live",
    orderId: "a3kd82",
  },
  {
    id: "mp-002",
    title: "Quai Genesis NFT Collection",
    description: "Rare 1/100 genesis mint on Quai Network. Includes governance rights and staking benefits.",
    price: 800,
    category: "Digital Assets",
    emoji: "🎨",
    seller: { address: "0x9c42...1e7a", initial: "Q" },
    deadline: "Sep 05, 2026",
    status: "live",
    orderId: "f7j2k9",
  },
  {
    id: "mp-003",
    title: "Smart Contract Audit Report",
    description: "Comprehensive Solidity/EVM audit from certified Web3 security firm. 7-day turnaround.",
    price: 1200,
    category: "Services",
    emoji: "🔒",
    seller: { address: "0x5d18...3c44", initial: "S" },
    deadline: "Sep 12, 2026",
    status: "live",
    orderId: "k2m9x4",
  },
  {
    id: "mp-004",
    title: "Sony WH-1000XM6 Headphones",
    description: "Flagship noise-cancelling headphones. Unopened retail box with warranty card included.",
    price: 320,
    category: "Electronics",
    emoji: "🎧",
    seller: { address: "0x1f87...6b29", initial: "M" },
    deadline: "Aug 25, 2026",
    status: "live",
    orderId: "p8n3v7",
  },
  {
    id: "mp-005",
    title: "DeFi Dashboard SaaS License",
    description: "1-year enterprise license for real-time DeFi portfolio analytics. Supports Quai, Ethereum, and Solana.",
    price: 500,
    category: "Digital Assets",
    emoji: "📊",
    seller: { address: "0xa2e3...9d51", initial: "D" },
    deadline: "Oct 01, 2026",
    status: "live",
    orderId: "t5q8w1",
  },
  {
    id: "mp-006",
    title: "Custom Dapp UI Design Package",
    description: "Full Figma-to-code UI kit for your Web3 dApp. Includes dark mode, responsive components, and brand system.",
    price: 950,
    category: "Services",
    emoji: "🎯",
    seller: { address: "0x7c64...2a08", initial: "X" },
    deadline: "Sep 20, 2026",
    status: "live",
    orderId: "r3y6m2",
  },
  {
    id: "mp-007",
    title: "Ledger Nano X Hardware Wallet",
    description: "New & sealed Ledger Nano X with Quai Network support. Bluetooth + USB-C. Ships with free case.",
    price: 150,
    category: "Electronics",
    emoji: "🔐",
    seller: { address: "0xe512...7f33", initial: "L" },
    deadline: "Aug 22, 2026",
    status: "live",
    orderId: "h9c4b6",
  },
  {
    id: "mp-008",
    title: "Web3 Logo & Brand Identity Kit",
    description: "Professional logo design, color palette, typography guide, and social assets for your protocol or DAO.",
    price: 400,
    category: "Services",
    emoji: "✨",
    seller: { address: "0x4b93...5e17", initial: "W" },
    deadline: "Sep 15, 2026",
    status: "live",
    orderId: "j1k7n5",
  },
];

const CATEGORIES = ["All", "Electronics", "Digital Assets", "Services"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "deadline", label: "Expiring Soon" },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = useMemo(() => {
    let results = MOCK_PRODUCTS;

    // Category filter
    if (activeCategory !== "All") {
      results = results.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "deadline":
        results = [...results].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      default:
        break;
    }

    return results;
  }, [searchQuery, activeCategory, sortBy]);

  const totalEscrowValue = MOCK_PRODUCTS.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />

      <main className={styles.mainArea}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>🛒 Marketplace</h1>
          <p className={styles.pageSub}>
            Browse protected product listings secured by smart contract escrow on Quai Network. Every purchase is trustless — funds are locked until you confirm delivery.
          </p>
        </div>

        {/* Stats Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{MOCK_PRODUCTS.length}</div>
            <div className={styles.statLabel}>Active Listings</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalEscrowValue.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Qi in Escrow</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>0%</div>
            <div className={styles.statLabel}>Protocol Fee</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>100%</div>
            <div className={styles.statLabel}>Escrow Protected</div>
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
              id="marketplace-search"
              type="text"
              className={styles.searchInput}
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterTab} ${activeCategory === cat ? styles.filterTabActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? "listing" : "listings"} found
          </span>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="marketplace-sort"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No listings match your search</h3>
              <p className={styles.emptyDesc}>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/order/${product.orderId}`}
                className={styles.productCard}
                id={`product-${product.id}`}
              >
                {/* Card Image / Visual Area */}
                <div className={styles.cardImageArea}>
                  <span className={styles.productEmoji}>{product.emoji}</span>
                  <span className={styles.escrowBadge}>
                    <span className={styles.escrowDot} />
                    Escrow Live
                  </span>
                  <span className={styles.categoryBadge}>{product.category}</span>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDesc}>{product.description}</p>

                  {/* Meta Row */}
                  <div className={styles.cardMeta}>
                    <div className={styles.sellerInfo}>
                      <span className={styles.sellerAvatar}>{product.seller.initial}</span>
                      <span className={styles.sellerAddr}>{product.seller.address}</span>
                    </div>
                    <span className={styles.deadlineBadge}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {product.deadline}
                    </span>
                  </div>

                  {/* Footer: Price & CTA */}
                  <div className={styles.cardFooter}>
                    <div className={styles.priceTag}>
                      <span className={styles.priceAmount}>{product.price.toLocaleString()}</span>
                      <span className={styles.priceCurrency}>Qi</span>
                    </div>
                    <span className={styles.buyBtn}>
                      View & Buy
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
