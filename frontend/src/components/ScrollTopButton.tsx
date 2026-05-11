"use client";

type ScrollTopButtonProps = {
  isVisible: boolean;
};

export function ScrollTopButton({ isVisible }: ScrollTopButtonProps) {
  return (
    <button
      className={`scroll-top${isVisible ? " visible" : ""}`}
      id="scrollTopBtn"
      type="button"
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
