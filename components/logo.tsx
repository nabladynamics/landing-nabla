import styles from "@/components/experience/spatial-navigation.module.css";

export function Wordmark() {
  return (
    <span className={styles.brand}>
      <svg viewBox="0 0 32 32" width="29" height="29" fill="none" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11h14L16 25Z" stroke="#b56b4b" strokeWidth="2" />
        <path d="M5 5h22L16 27Z" stroke="currentColor" strokeWidth="2.2" />
      </svg>
      <span>Nabla AI</span>
    </span>
  );
}
