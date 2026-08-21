"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FarcasterShareButton from "@/components/FarcasterShareButton";
import ExplorerLink from "@/components/ExplorerLink";
import { useProductEscrow } from "@/hooks/useProductEscrow";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowContracts, CONTRACT_ADDRESSES } from "@/hooks/useEscrowContracts";
import { useToast } from "@/context/ToastContext";
import styles from "./Marketplace.module.css";

const DEFAULT_PRODUCT_IMAGES = {
  Electronics: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "Digital Assets": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80",
  Services: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  General: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
};

const MOCK_PRODUCTS = [
  {
    id: "mp-001",
    title: "MacBook Pro 16 M4 Max",
    description: "Brand new in sealed box. 48GB RAM, 1TB SSD. Ships internationally with tracking & insurance.",
    price: 2400,
    category: "Electronics",
    badgeTag: "HARDWARE",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    seller: { address: "0x001c...3f47", initial: "B" },
    deadline: "3 Days",
    status: "live",
    orderId: "a3kd82",
    txHash: "0x0067f487e59f0C45922854F32B6d8deD8e820776",
  },
  {
    id: "mp-002",
    title: "Quai Genesis NFT Collection",
    description: "Rare 1/100 genesis mint on Quai Network. Includes governance rights and staking benefits.",
    price: 800,
    category: "Digital Assets",
    badgeTag: "DIGITAL",
    imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80",
    seller: { address: "0x0035...fbc6", initial: "Q" },
    deadline: "5 Days",
    status: "live",
    orderId: "f7j2k9",
    txHash: "0x001cdd4aad8A8Fa1e0781d30602d4Adc37603f47",
  },
  {
    id: "mp-003",
    title: "Smart Contract Audit Report",
    description: "Comprehensive Solidity/EVM audit from certified Web3 security firm. 7-day turnaround.",
    price: 1200,
    category: "Services",
    badgeTag: "SERVICE",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    seller: { address: "0x000E...8fbA", initial: "S" },
    deadline: "7 Days",
    status: "live",
    orderId: "k2m9x4",
    txHash: "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA",
  },
];

export default function MarketplacePage() {
  const { orders: onChainOrders, loading: onChainLoading } = useProductEscrow();
  const { account, isConnected, connectWallet } = useWallet();
  const { createOrder, depositProductEscrow, loading: contractLoading } = useEscrowContracts();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Local state for custom created listings
  const [customListings, setCustomListings] = useState([]);

  // Create Product Listing Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriceQi, setFormPriceQi] = useState("1000");
  const [formCategory, setFormCategory] = useState("Electronics");
  const [formDeadlineDays, setFormDeadlineDays] = useState("3");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Buy Product Modal State
  const [selectedBuyProduct, setSelectedBuyProduct] = useState(null);

  // Merge live on-chain ProductEscrow orders, custom listings, and catalog items
  const allListings = useMemo(() => {
    const liveItems = onChainOrders.map((ord, idx) => ({
      id: ord.id || `live-${idx}`,
      title: ord.title || "On-Chain Product Listing",
      description: "On-chain ProductEscrow listing on Quai Cyprus-1. Funds protected until buyer confirms delivery.",
      price: ord.priceQi || 1000,
      category: "Digital Assets",
      badgeTag: "ON-CHAIN",
      imageUrl: DEFAULT_PRODUCT_IMAGES["Digital Assets"],
      seller: { address: ord.seller ? `${ord.seller.slice(0, 6)}...${ord.seller.slice(-4)}` : "0x001c...3f47", initial: "Q" },
      deadline: "3 Days",
      status: "live",
      orderId: ord.id ? ord.id.slice(0, 8) : "a3kd82",
      txHash: CONTRACT_ADDRESSES.ProductEscrow,
    }));
    return [...customListings, ...liveItems, ...MOCK_PRODUCTS];
  }, [onChainOrders, customListings]);

  // Aggregate Stats
  const totalMarketVolume = useMemo(() => {
    return allListings.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [allListings]);

  const avgProductPrice = useMemo(() => {
    return allListings.length > 0 ? Math.round(totalMarketVolume / allListings.length) : 0;
  }, [allListings, totalMarketVolume]);

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

  // Image Fallback Handler
  const handleImageError = (e, category) => {
    e.target.src = DEFAULT_PRODUCT_IMAGES[category] || DEFAULT_PRODUCT_IMAGES.General;
  };

  // Submit Create Product Listing Form
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast({ message: "Please enter a product title.", type: "error" });
      return;
    }
    const priceNum = parseFloat(formPriceQi);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast({ message: "Please enter a valid listing price in Qi.", type: "error" });
      return;
    }

    if (!isConnected) {
      addToast({ message: "Please connect your wallet to create a listing on-chain.", type: "prompt" });
      connectWallet();
      return;
    }

    try {
      addToast({ message: "Awaiting wallet signature to create product listing...", type: "prompt" });

      const hash = await createOrder({
        title: formTitle,
        description: formDesc,
        priceQi: priceNum,
        deadlineDays: Number(formDeadlineDays),
      });

      addToast({
        message: "Product Listing created on Quai Cyprus-1",
        type: "success",
        txHash: hash,
      });

      const chosenImg = formImageUrl.trim() || DEFAULT_PRODUCT_IMAGES[formCategory] || DEFAULT_PRODUCT_IMAGES.General;

      const newListing = {
        id: `custom-prod-${Date.now()}`,
        title: formTitle,
        description: formDesc || "Protected P2P product listing on Quai Network.",
        price: priceNum,
        category: formCategory,
        badgeTag: formCategory.toUpperCase(),
        imageUrl: chosenImg,
        seller: { address: `${account.slice(0, 6)}...${account.slice(-4)}`, initial: "YOU" },
        deadline: `${formDeadlineDays} Days`,
        status: "live",
        orderId: hash.slice(0, 8),
        txHash: CONTRACT_ADDRESSES.ProductEscrow,
      };

      setCustomListings((prev) => [newListing, ...prev]);
      setIsCreateModalOpen(false);
      setFormTitle("");
      setFormDesc("");
      setFormPriceQi("1000");
      setFormImageUrl("");
    } catch (err) {
      addToast({ message: `Listing Creation Failed: ${err.message}`, type: "error" });
    }
  };

  // Deposit Escrow Payout Handler
  const handleDepositEscrowSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuyProduct) return;

    if (!isConnected) {
      addToast({ message: "Please connect your wallet to deposit escrow funds.", type: "prompt" });
      connectWallet();
      return;
    }

    try {
      addToast({ message: "Awaiting wallet signature to deposit Qi into ProductEscrow...", type: "prompt" });

      const hash = await depositProductEscrow(selectedBuyProduct.orderId, selectedBuyProduct.price);

      addToast({
        message: `${selectedBuyProduct.price.toLocaleString()} Qi locked in ProductEscrow on Quai Cyprus-1`,
        type: "success",
        txHash: hash,
      });

      setSelectedBuyProduct(null);
    } catch (err) {
      addToast({ message: `Escrow Deposit Failed: ${err.message}`, type: "error" });
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar mode="individual" />

      <main className={styles.mainArea}>
        {/* Header Hero Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <span className={styles.badgeLabel}>QUAI NETWORK PROTECTED COMMERCE</span>
            <h1 className={styles.title}>
              P2P Product <span className="gradient-text">Escrow Marketplace</span>
            </h1>
            <p className={styles.subtitle}>
              Buy & sell products safely with smart-contract escrow on Quai Network. Seller receives funds only after buyer confirms delivery.
            </p>
          </div>

          <button
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create Product Listing
          </button>
        </div>

        {/* Stats Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalMarketVolume.toLocaleString()} Qi</div>
            <div className={styles.statLabel}>Total Marketplace Volume</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{allListings.length} Listings</div>
            <div className={styles.statLabel}>Active Protected Products</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{avgProductPrice.toLocaleString()} Qi</div>
            <div className={styles.statLabel}>Average Item Price</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>100% Protected</div>
            <div className={styles.statLabel}>Delivery Escrow SLA</div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products, electronics, or services..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            {categories.map((cat) => (
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

        {/* Results Info Bar */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            Showing <strong>{filteredProducts.length}</strong> of {allListings.length} product listings
          </span>

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

        {/* Indexing Indicator */}
        {onChainLoading && (
          <div className={styles.loadingBox}>
            <span>Indexing live ProductEscrow smart contract events on Quai Cyprus-1...</span>
          </div>
        )}

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {filteredProducts.map((p) => (
            <div key={p.id} className={styles.productCard}>
              <div className={styles.cardImageArea}>
                <img
                  src={p.imageUrl || DEFAULT_PRODUCT_IMAGES[p.category] || DEFAULT_PRODUCT_IMAGES.General}
                  alt={p.title}
                  className={styles.productImg}
                  onError={(e) => handleImageError(e, p.category)}
                />
                <div className={styles.cardImageOverlay} />

                <div className={styles.productBadgeTag}>{p.badgeTag || "ITEM"}</div>
                <span className={styles.categoryBadge}>{p.category}</span>
                <div className={styles.escrowBadge}>
                  <span className={styles.escrowDot} /> Escrow Protected
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.productTitle}>{p.title}</h3>
                <p className={styles.productDesc}>{p.description}</p>

                <div className={styles.cardMeta}>
                  <div className={styles.sellerInfo}>
                    <span className={styles.sellerAvatar}>{p.seller.initial}</span>
                    <span className={styles.sellerAddr}>{p.seller.address}</span>
                  </div>
                  <span className={styles.deadlineBadge}>{p.deadline} Window</span>
                </div>

                {p.txHash && (
                  <div style={{ margin: "10px 0 6px 0" }}>
                    <ExplorerLink hash={p.txHash} label="Quaiscan Contract Receipt" />
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.priceTag}>
                    <span className={styles.priceAmount}>{p.price.toLocaleString()}</span>
                    <span className={styles.priceCurrency}>Qi</span>
                  </div>

                  <div className={styles.ctaGroup}>
                    <FarcasterShareButton
                      text={`Check out this protected product listing: "${p.title}" (${p.price} Qi) on Quai Network!`}
                      buttonText="Share"
                    />
                    <button
                      className={styles.buyBtn}
                      onClick={() => setSelectedBuyProduct(p)}
                    >
                      Buy with Escrow ({p.price.toLocaleString()} Qi)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No product listings found</h3>
            <p className={styles.emptyDesc}>Try adjusting your search query or switching categories.</p>
          </div>
        )}
      </main>

      {/* POP-UP MODAL 1: CREATE PRODUCT LISTING */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsCreateModalOpen(false)}>
              ✕
            </button>

            <div className={styles.modalHeader}>
              <span className={styles.modalBadge}>ProductEscrow.sol</span>
              <h2 className={styles.modalTitle}>Create Product Listing</h2>
              <p className={styles.modalSub}>
                List a product or service with smart-contract escrow protection on Quai Network. Buyers deposit Qi which unlocks only after confirmed delivery.
              </p>
            </div>

            <form onSubmit={handleCreateProductSubmit} className={styles.modalForm}>
              {/* Title Input */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 16 M4 Max"
                  className={styles.formInput}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Product Image URL Input */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className={styles.formInput}
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", color: "#94A3B8", alignSelf: "center" }}>Sample Presets:</span>
                  <button
                    type="button"
                    className="btn btn-outlined btn-sm"
                    style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                    onClick={() => setFormImageUrl(DEFAULT_PRODUCT_IMAGES.Electronics)}
                  >
                    Hardware Image
                  </button>
                  <button
                    type="button"
                    className="btn btn-outlined btn-sm"
                    style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                    onClick={() => setFormImageUrl(DEFAULT_PRODUCT_IMAGES["Digital Assets"])}
                  >
                    NFT Image
                  </button>
                  <button
                    type="button"
                    className="btn btn-outlined btn-sm"
                    style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                    onClick={() => setFormImageUrl(DEFAULT_PRODUCT_IMAGES.Services)}
                  >
                    Security Audit Image
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Item Specifications & Shipping Terms</label>
                <textarea
                  rows={3}
                  placeholder="Detail condition, memory/storage specs, warranty, tracking details, and shipping terms..."
                  className={styles.formTextarea}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* Category & Delivery Window */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Product Category</label>
                  <select
                    className={styles.formSelect}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Electronics">Electronics & Hardware</option>
                    <option value="Digital Assets">Digital Assets & NFTs</option>
                    <option value="Services">Services & Security</option>
                    <option value="General">General Merchandise</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Delivery Window (Days)</label>
                  <select
                    className={styles.formSelect}
                    value={formDeadlineDays}
                    onChange={(e) => setFormDeadlineDays(e.target.value)}
                  >
                    <option value="3">3 Days (Fast Ship)</option>
                    <option value="5">5 Days (Standard)</option>
                    <option value="7">7 Days (International)</option>
                    <option value="14">14 Days (Custom/Service)</option>
                  </select>
                </div>
              </div>

              {/* Escrow Price */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Escrow Lock Price (Qi) *</label>
                <div className={styles.currencyInputWrapper}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1000"
                    className={styles.formInput}
                    value={formPriceQi}
                    onChange={(e) => setFormPriceQi(e.target.value)}
                    required
                  />
                  <span className={styles.currencySuffix}>Qi</span>
                </div>
                <span className={styles.inputHelp}>
                  Buyer must deposit this exact Qi amount into ProductEscrow to purchase.
                </span>
              </div>

              {/* Contract Verification Notice */}
              <div className={styles.contractNotice}>
                <div className={styles.noticeShieldIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.noticeTitle}>ProductEscrow.sol Verification</div>
                  <div className={styles.noticeText}>
                    Triggers <code>ProductEscrow.createOrder(title, description, priceWei, deadlineDays)</code> on Quai Cyprus-1.
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn btn-outlined"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={contractLoading}
                  style={{ minWidth: "220px", justifyContent: "center" }}
                >
                  {contractLoading ? "Creating Listing..." : `Publish Product Listing (${formPriceQi} Qi)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: BUY PRODUCT & DEPOSIT ESCROW */}
      {selectedBuyProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBuyProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedBuyProduct(null)}>
              ✕
            </button>

            {/* Modal Product Hero Image */}
            <div style={{
              height: "180px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              marginBottom: "18px"
            }}>
              <img
                src={selectedBuyProduct.imageUrl || DEFAULT_PRODUCT_IMAGES[selectedBuyProduct.category] || DEFAULT_PRODUCT_IMAGES.General}
                alt={selectedBuyProduct.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => handleImageError(e, selectedBuyProduct.category)}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(11, 19, 43, 0.2) 0%, rgba(11, 19, 43, 0.85) 100%)"
              }} />
            </div>

            <div className={styles.modalHeader}>
              <div className={styles.cardBadges} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <span className={styles.categoryBadge} style={{ position: "static" }}>{selectedBuyProduct.category}</span>
                <span className={styles.escrowBadge} style={{ position: "static" }}>
                  <span className={styles.escrowDot} /> Escrow Protected
                </span>
              </div>

              <h2 className={styles.modalTitle}>
                {selectedBuyProduct.title}
              </h2>
              <p className={styles.modalSub}>
                Seller: <code style={{ color: "#00D4AA" }}>{selectedBuyProduct.seller.address}</code> • Order ID: <code>{selectedBuyProduct.orderId}</code>
              </p>
            </div>

            {/* Price Banner */}
            <div className={styles.productPriceBanner}>
              <div>
                <span className={styles.priceBannerLabel}>Required Escrow Deposit</span>
                <div className={styles.priceBannerValue}>{selectedBuyProduct.price.toLocaleString()} Qi</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={styles.priceBannerLabel}>Delivery Window</span>
                <div className={styles.priceBannerSub}>{selectedBuyProduct.deadline}</div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Specifications & Shipping Terms</h4>
              <p className={styles.detailText}>{selectedBuyProduct.description}</p>
            </div>

            {/* Protection Notice */}
            <div className={styles.protectionBox}>
              <div className={styles.noticeShieldIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div className={styles.protectionTitle}>Quai Network Buyer Guarantee</div>
                <div className={styles.protectionText}>
                  Your {selectedBuyProduct.price.toLocaleString()} Qi deposit is wrapped to WQI and held safely in <code>ProductEscrow.sol</code>. Funds release to the seller only after you confirm successful delivery.
                </div>
              </div>
            </div>

            {/* Contract Explorer Receipt */}
            {selectedBuyProduct.txHash && (
              <div style={{ margin: "16px 0" }}>
                <ExplorerLink hash={selectedBuyProduct.txHash} label="ProductEscrow Contract Evidence & Receipt" />
              </div>
            )}

            {/* Action Buttons */}
            <form onSubmit={handleDepositEscrowSubmit} className={styles.modalActions} style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-outlined"
                onClick={() => setSelectedBuyProduct(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={contractLoading}
                style={{ minWidth: "240px", justifyContent: "center" }}
              >
                {contractLoading ? "Signing Escrow Deposit..." : `Deposit ${selectedBuyProduct.price.toLocaleString()} Qi & Buy`}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
