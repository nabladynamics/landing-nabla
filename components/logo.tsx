import styles from "@/components/experience/spatial-navigation.module.css";

export function Wordmark() {
  return (
    <span className={styles.brand}>
      <svg viewBox="0 0 32 32" width="29" height="29" aria-hidden="true">
        <path
          d="M3 5h26L16 27ZM6.25 6.9 16 23.4 25.75 6.9Z"
          fill="#111111"
          fillRule="evenodd"
        />
      </svg>
      <span>Nabla AI</span>
    </span>
  );
}
