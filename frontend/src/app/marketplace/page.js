"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import ExplorerLink from "@/components/ExplorerLink";
import { useProductEscrow } from "@/hooks/useProductEscrow";
import styles from "./Marketplace.module.css";

const MOCK_PRODUCTS = [
  {
    id: "mp-001",
    title: "MacBook Pro 16\" M4 Max",
    description: "Brand new in sealed box. 48GB RAM, 1TB SSD. Ships internationally with tracking & insurance.",
    price: 2400,
    category: "Electronics",
    emoji: "💻",
    seller: { address: "0x001c...3f47", initial: "B" },
    deadline: "3 Days",
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
    seller: { address: "0x0035...fbc6", initial: "Q" },
    deadline: "5 Days",
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
    seller: { address: "0x000E...8fbA", initial: "S" },
    deadline: "7 Days",
    status: "live",
    orderId: "k2m9x4",
  },
];

export default function MarketplacePage() {
  const { orders: onChainOrders, loading: onChainLoading } = useProductEscrow();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Merge live on-chain ProductEscrow orders with catalog listings (#28)
  const allListings = useMemo(() => {
    const liveItems = onChainOrders.map((ord, idx) => ({
      id: ord.id || `live-${idx}`,
      title: ord.title,
      description: "On-chain ProductEscrow listing on Quai Cyprus-1. Funds protected until buyer confirms delivery.",
      price: ord.priceQi,
      category: "Digital Assets",
      emoji: "🛍️",
      seller: { address: ord.seller, initial: "Q" },
      deadline: "3 Days",
      status: "live",
      orderId: ord.id.slice(0, 8),
      txHash: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47",
    }));
    return [...liveItems, ...MOCK_PRODUCTS];
  }, [onChainOrders]);

  const categories = ["All", "Electronics", "Digital Assets", "Services"];

  const filteredProducts = useMemo(() => {
    return allListings
      .filter((p) => {
        const matchesCat = activeCategory === "All" || p.category === activeCategory;
        const matchesQuery =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [allListings, activeCategory, searchQuery, sortBy]);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div>
            <span className={styles.badgeLabel}>⚡ Quai Network Protected Commerce</span>
            <h1 className={styles.title}>
              P2P Product <span className="gradient-text">Escrow Marketplace</span>
            </h1>
            <p className={styles.subtitle}>
              Buy & sell products safely with smart-contract escrow on Quai Network. Seller receives funds only after buyer confirms delivery.
            </p>
          </div>

          <Link href="/order/create" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            + Create Product Listing
          </Link>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.categoryGroup}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.searchSortGroup}>
            <input
              type="text"
              placeholder="Search listings..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton (#28) */}
        {onChainLoading && (
          <div style={{ color: "#00D4AA", fontSize: "0.9rem", padding: "10px 0" }}>
            ⏳ Indexing live ProductEscrow smart contract events on Quai Cyprus-1...
          </div>
        )}

        {/* Grid */}
        <div className={styles.grid}>
          {filteredProducts.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEmoji}>{p.emoji}</span>
                <span className={styles.categoryBadge}>{p.category}</span>
              </div>

              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>

              <div className={styles.cardMeta}>
                <div>
                  <span className={styles.priceLabel}>Escrow Lock Price</span>
                  <div className={styles.priceVal}>{p.price.toLocaleString()} Qi</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className={styles.priceLabel}>Seller</span>
                  <div className={styles.sellerAddr}>{p.seller.address}</div>
                </div>
              </div>

              {p.txHash && (
                <div style={{ margin: "10px 0 6px 0" }}>
                  <ExplorerLink hash={p.txHash} label="Quaiscan Contract Receipt" />
                </div>
              )}

              <div className={styles.cardFooter}>
                <Link href={`/order/${p.orderId}`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  Buy with Escrow ({p.price.toLocaleString()} Qi)
                </Link>
                <FarcasterShareButton
                  text={`Check out this protected product listing: ${p.title} (${p.price} Qi) on Quai Network! 🛍️`}
                  buttonText="Share"
                />
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No listings found</h3>
            <p>Try adjusting your category or search query.</p>
          </div>
        )}
      </main>
    </div>
  );
}
