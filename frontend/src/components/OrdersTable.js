import Link from "next/link";
import styles from "./OrdersTable.module.css";

export default function OrdersTable({ ordersData = [], viewState = "connected" }) {
  if (viewState === "empty") {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconBox}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <h3>No Orders Yet</h3>
        <p>You haven't created or received any escrow orders yet.</p>
        <button className="btn btn-primary" style={{ marginTop: "16px" }}>
          Create First Escrow Order
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Parties</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {ordersData.map((order) => (
            <tr key={order.id} className={styles.tableRow} onClick={() => window.location.href = order.href}>
              <td className={styles.orderId}>
                <Link href={order.href}>{order.id}</Link>
              </td>
              <td className={styles.partiesCell}>{order.parties}</td>
              <td className={styles.amountCell}>{order.amount}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[order.statusType]}`}>
                  {order.status}
                </span>
              </td>
              <td className={styles.deadlineCell}>{order.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
