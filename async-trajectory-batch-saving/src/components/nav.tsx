"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#about", label: "О курсе" },
  { href: "#program", label: "Программа" },
  { href: "#materials", label: "Материалы" },
  { href: "#faq", label: "Вопросы" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-edge/60 bg-abyss/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5">
        <a href="#about" className="flex items-center gap-3" aria-label="К началу страницы">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-kadry.webp" alt="Кадры для космоса" className="h-7 w-auto" />
          <span className="h-5 w-px bg-edge" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-fakt.webp" alt="ФАКТ МФТИ" className="h-6 w-auto" />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Разделы лендинга">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mist transition-colors hover:text-ice"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="#link-notice"
            data-resource="registration"
            data-label="Регистрация на курс"
            className="hidden items-center gap-2 bg-mint px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-abyss transition-shadow hover:shadow-[0_0_28px_rgba(61,245,166,0.5)] sm:flex"
          >
            Записаться
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="grid size-9 place-items-center border border-edge text-mist transition-colors hover:text-ice md:hidden"
          >
            {open ? <X className="size-4" strokeWidth={1.5} /> : <Menu className="size-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-edge/60 bg-abyss/95 px-5 py-3 backdrop-blur-md md:hidden" aria-label="Мобильное меню">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block border-b border-edge/40 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-mist transition-colors last:border-0 hover:text-ice"
            >
              {label}
            </a>
          ))}
          <a
            href="#link-notice"
            data-resource="registration"
            data-label="Регистрация на курс"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 bg-mint px-4 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-abyss"
          >
            Записаться
          </a>
        </nav>
      )}
    </header>
  );
}
