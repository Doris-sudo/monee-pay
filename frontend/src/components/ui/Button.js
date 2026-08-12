import styles from "./Button.module.css";

export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.md;
  
  return (
    <button className={`${styles.btn} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
