import styles from "./Badge.module.css";

export default function Badge({ children, variant = "teal", className = "", ...props }) {
  const variantClass = styles[variant] || styles.teal;
  return (
    <span className={`${styles.badge} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
