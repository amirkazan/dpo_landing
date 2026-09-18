"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    COURSE_LINKS?: Record<string, string | null>;
  }
}

/**
 * Разрешает внешние ссылки через window.COURSE_LINKS (public/links.js).
 * Известным ссылкам ставит настоящий href, остальные открывают диалог
 * #link-notice с заголовком из data-label.
 */
export function LinkResolver() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const links = window.COURSE_LINKS ?? {};
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[data-resource]"));

    const onClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const resource = a.dataset.resource ?? "";
      const url = links[resource];
      if (typeof url === "string" && /^https?:\/\//.test(url)) return; // настоящая ссылка — открываем обычно
      e.preventDefault();
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (titleRef.current) titleRef.current.textContent = a.dataset.label || "Материал курса";
      dialog.showModal();
    };

    for (const a of anchors) {
      const resource = a.dataset.resource ?? "";
      const url = links[resource];
      if (typeof url === "string" && /^https?:\/\//.test(url)) {
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.addEventListener("click", onClick);
    }
    return () => {
      for (const a of anchors) a.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="link-notice"
      aria-labelledby="link-notice-title"
      className="panel-line corner-ticks fixed inset-0 m-auto w-[min(92vw,28rem)] bg-panel p-0 text-ghost backdrop:bg-abyss/80 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mint/80">
          <span className="mr-2 text-mist/50">{"//"}</span>ссылка скоро появится
        </p>
        <h2 id="link-notice-title" ref={titleRef} className="mt-3 font-display text-xl font-semibold text-ice">
          Материал курса
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Ссылка на этот раздел пока не опубликована. Она появится здесь, когда организаторы предоставят актуальный адрес.
        </p>
        <button
          type="button"
          onClick={(e) => e.currentTarget.closest("dialog")?.close()}
          className="mt-6 w-full bg-mint px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-abyss transition-shadow hover:shadow-[0_0_28px_rgba(61,245,166,0.5)]"
        >
          Понятно
        </button>
      </div>
    </dialog>
  );
}
