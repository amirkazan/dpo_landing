"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Check, Copy, TriangleAlert, Zap } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------- section kicker label ------------------------- */

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.32em] text-mint/80 ${className}`}>
      <span className="mr-2 text-mist/50">{"//"}</span>
      {children}
    </p>
  );
}

/* ------------------------------ panel shell ----------------------------- */

export function Panel({ children, className = "", ticks = true }: { children: ReactNode; className?: string; ticks?: boolean }) {
  return <div className={`panel-line ${ticks ? "corner-ticks" : ""} ${className}`}>{children}</div>;
}

/* ------------------------------ maneuver tag ---------------------------- */

export function ManeuverBadge({ active }: { active: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1 border border-edge px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mist/60">
        ballistic
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-amber-hot/50 bg-amber-hot/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-hot">
      <Zap className="size-3" strokeWidth={2} />
      maneuver
    </span>
  );
}

/* -------------------------- animated stat number ------------------------ */

export function AnimatedNumber({ value, format = (n: number) => String(Math.round(n)) }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => motionValue.set(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {text}
    </motion.span>
  );
}

/* -------------------------------- code block ---------------------------- */

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative border border-edge bg-black/40">
      <div className="flex items-center justify-between border-b border-edge/70 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist/60">{title ?? "shell"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist/70 transition-colors hover:text-mint"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3 text-mint" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-relaxed text-ghost/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------------- notice box ----------------------------- */

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 border border-rose-alert/40 bg-rose-alert/10 px-3 py-2 font-mono text-xs text-rose-alert">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
      <span className="break-all">{message}</span>
    </div>
  );
}

/* ------------------------------ reveal wrap ----------------------------- */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ page loader ----------------------------- */

export function RadarLoader({ label = "acquiring" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
      <span className="relative grid size-5 place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border border-edge border-t-mint" style={{ animationDuration: "0.9s" }} />
      </span>
      {label}
      <span className="animate-blink text-mint">▮</span>
    </div>
  );
}
