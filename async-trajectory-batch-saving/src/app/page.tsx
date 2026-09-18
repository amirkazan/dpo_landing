"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpenCheck,
  Compass,
  Cpu,
  FlaskConical,
  GraduationCap,
  MessagesSquare,
  MonitorPlay,
  Orbit,
  Radar,
  Rocket,
  Satellite,
  Users,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { LinkResolver } from "@/components/LinkResolver";
import { AnimatedNumber, Kicker, Panel, Reveal } from "@/components/ui";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 blueprint-grid opacity-40" />,
});

const TICKER_ITEMS = [
  "144 часа · 5 модулей · 22 занятия",
  "ПК «Интеграл» — моделирование спутниковых миссий",
  "Очно + онлайн · записи доступны всегда",
  "Орбитальная динамика → защита проекта",
  "Финал — аванпроект перед экспертами отрасли",
];

const STATS = [
  { label: "часов программы", value: 144, icon: Radar },
  { label: "модулей", value: 5, icon: Orbit },
  { label: "занятия", value: 22, icon: MonitorPlay },
  { label: "формата: очно и онлайн", value: 2, icon: Users },
];

const ABOUT = [
  {
    n: "01",
    icon: Satellite,
    title: "ФУНДАМЕНТ",
    body: "Как устроены и работают космические системы: от орбитальной динамики до архитектуры космического аппарата.",
    accent: "text-cyan-glow",
  },
  {
    n: "02",
    icon: FlaskConical,
    title: "ИНСТРУМЕНТЫ",
    body: "Численное моделирование и проектирование в профессиональном ПО — программном комплексе «Интеграл».",
    accent: "text-mint",
  },
  {
    n: "03",
    icon: Rocket,
    title: "ПРАКТИКА",
    body: "Разработка своего аванпроекта системы ДЗЗ или космической связи — от идеи до защиты перед экспертами.",
    accent: "text-amber-hot",
  },
];

const MODULES = [
  { n: "01", title: "Орбитальная динамика" },
  { n: "02", title: "Проектирование космических систем и оценка эффективности" },
  { n: "03", title: "Устройство космического аппарата" },
  { n: "04", title: "Имитационное моделирование" },
  { n: "05", title: "Защита собственного проекта" },
];

const LEARNING = [
  {
    icon: MonitorPlay,
    title: "2 пары в неделю",
    body: "Занятия в течение всего учебного года — чётко и без воды. Семинары и лабораторные работы в связке.",
  },
  {
    icon: Cpu,
    title: "Работа в ПК «Интеграл»",
    body: "Лабораторные — в реальном инструменте моделирования спутниковых миссий, разработанном в МФТИ.",
  },
  {
    icon: Users,
    title: "Очно и онлайн",
    body: "Два формата на выбор, записи занятий доступны всегда, на связи — организаторы и преподаватели.",
  },
];

const INTEGRAL_LABS = [
  { src: "/assets/integral-ballistics.gif", label: "Баллистика и выведение на орбиту" },
  { src: "/assets/integral-coverage.gif", label: "Расчёт зон покрытия территории" },
  { src: "/assets/integral-swaths.gif", label: "Полосы обзора и периодичность наблюдения" },
];

const MISSION = [
  {
    icon: Satellite,
    title: "Космос меняется на глазах",
    body: "Многоспутниковые системы и сервисы на их основе становятся доступны каждому — отрасли нужны люди, которые умеют их проектировать.",
  },
  {
    icon: Compass,
    title: "В чём наша миссия?",
    body: "Научить проектировать реальный рабочий сервис на основе спутниковой системы — от идеи до защиты проекта.",
  },
  {
    icon: Rocket,
    title: "Почему именно этот курс?",
    body: "Каждый модуль — практика, финал — защита собственного аванпроекта перед экспертами отрасли и готовый кейс в портфолио.",
  },
];

const FINAL = [
  { icon: GraduationCap, text: "Удостоверение о прохождении программы дополнительного профессионального образования" },
  { icon: MessagesSquare, text: "Обратная связь от практикующих экспертов отрасли" },
  { icon: Award, text: "Карьерная консультация и стажировка в МФТИ и на предприятиях-партнёрах" },
];

const MATERIALS = [
  { resource: "recordings", label: "Видеозаписи лекций" },
  { resource: "assignments", label: "Задания по курсу" },
  { resource: "guides", label: "Методические материалы" },
  { resource: "syllabus", label: "Полная программа курса" },
  { resource: "presentation", label: "Презентация курса" },
  { resource: "assessment", label: "Правила итоговой аттестации" },
];

const FAQ = [
  {
    q: "Кому подходит программа?",
    a: "Всем, кто хочет научиться создавать спутниковые системы — от идеи до защиты собственного проекта. Программа идёт в течение учебного года и не требует специального оборудования: лабораторные выполняются в ПК «Интеграл».",
  },
  {
    q: "Сколько длится обучение?",
    a: "Весь учебный год: 144 часа, 5 модулей, 22 занятия — 2 пары в неделю.",
  },
  {
    q: "Можно ли учиться онлайн?",
    a: "Да. Есть очный и онлайн форматы, записи всех занятий доступны всегда, а организаторы и преподаватели остаются на связи.",
  },
  {
    q: "На чём выполняются лабораторные?",
    a: "В программном комплексе «Интеграл» — инструменте моделирования спутниковых миссий, разработанном сотрудниками МФТИ.",
  },
  {
    q: "Что я получу в финале?",
    a: "Удостоверение о прохождении программы, обратную связь от практикующих экспертов отрасли, карьерную консультацию и возможность стажировки в МФТИ и на предприятиях-партнёрах.",
  },
  {
    q: "Как проходит итоговая аттестация?",
    a: "Финал программы — защита собственного аванпроекта системы ДЗЗ или космической связи перед экспертами отрасли.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative">
      <Nav />
      <LinkResolver />

      {/* ================================ HERO ================================ */}
      <section className="scanlines relative flex min-h-svh flex-col overflow-hidden">
        <div className="absolute inset-0">
          <HeroScene />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(4,7,13,0.72)_100%)]" />

        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-10 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <Kicker className="mb-5">Дополнительное профессиональное образование · ФАКТ МФТИ</Kicker>
            <h1 className="max-w-5xl font-display text-[clamp(1.9rem,5.4vw,4.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ice">
              СОВРЕМЕННЫЕ ПОДХОДЫ К РАЗРАБОТКЕ{" "}
              <span className="text-glow-mint text-mint">СИСТЕМ ДЗЗ И КОСМИЧЕСКОЙ СВЯЗИ</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mt-6 max-w-xl text-[15px] leading-relaxed text-mist"
          >
            Как научиться создавать спутниковые системы от идеи до защиты проекта?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#link-notice"
              data-resource="registration"
              data-label="Регистрация на курс"
              className="group flex items-center gap-2 bg-mint px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-abyss transition-shadow hover:shadow-[0_0_36px_rgba(61,245,166,0.5)]"
            >
              Зарегистрироваться
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </a>
            <a
              href="#materials"
              className="flex items-center gap-2 border border-edge bg-hull/60 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ghost backdrop-blur transition-colors hover:border-cyan-glow/60 hover:text-cyan-glow"
            >
              Материалы курса
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
            <a
              href="#about"
              className="flex items-center gap-2 border border-edge bg-hull/60 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ghost backdrop-blur transition-colors hover:border-mint/60 hover:text-mint"
            >
              О курсе
            </a>
          </motion.div>
        </div>

        {/* telemetry ticker */}
        <div className="relative z-10 border-t border-edge/60 bg-abyss/60 backdrop-blur-sm">
          <div className="flex overflow-hidden py-2.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="flex min-w-max animate-ticker items-center gap-8 pr-8">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} className="flex items-center gap-8 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-mist/60">
                  {t}
                  <span className="text-mint/50">▚</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =============================== STATS =============================== */}
      <section className="relative border-b border-edge/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-edge/50 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="group px-5 py-8 md:px-8">
              <s.icon className="mb-4 size-4 text-mint/70 transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.5} />
              <div className="font-display text-3xl font-semibold tabular-nums text-ice md:text-4xl">
                <AnimatedNumber value={s.value} />
              </div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-mist/70">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================================ ABOUT ============================== */}
      <section id="about" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:py-32">
        <Reveal>
          <Kicker>о курсе</Kicker>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
            Чему вы научитесь?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-edge/60 bg-edge/60 md:grid-cols-3">
          {ABOUT.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="group relative h-full bg-hull p-7 transition-colors duration-500 hover:bg-panel">
                <span className="absolute right-6 top-6 font-display text-5xl font-bold text-edge transition-colors duration-500 group-hover:text-mint/25">
                  {s.n}
                </span>
                <s.icon className={`size-5 ${s.accent}`} strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-semibold tracking-[0.14em] text-ice">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mist">{s.body}</p>
                <span className="mt-5 block h-px w-full bg-gradient-to-r from-mint/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Reveal>
            <Panel className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/lab-laptop.webp"
                alt="Лабораторная работа в ПК «Интеграл» на ноутбуке"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </Panel>
          </Reveal>
          <Reveal delay={0.08}>
            <Panel className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/classroom.webp"
                alt="Очное занятие курса в аудитории МФТИ"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </Panel>
          </Reveal>
        </div>
      </section>

      {/* =============================== PROGRAM ============================= */}
      <section id="program" className="relative border-t border-edge/50 bg-hull/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl scroll-mt-20 px-5">
          <Reveal>
            <Kicker>программа</Kicker>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
              Что именно будем изучать?
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
              5 модулей, благодаря которым каждый сможет в финале сделать свой собственный проект.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden border border-edge/60 bg-edge/60 sm:grid-cols-2 lg:grid-cols-5">
            {MODULES.map((m, i) => (
              <Reveal key={m.n} delay={i * 0.06}>
                <div className="group flex h-full flex-col bg-hull p-6 transition-colors duration-500 hover:bg-panel">
                  <span className="font-display text-4xl font-bold text-edge transition-colors duration-500 group-hover:text-mint/30">{m.n}</span>
                  <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug text-ice">{m.title}</h3>
                  <span className="mt-auto block pt-5">
                    <span className="block h-px w-full bg-gradient-to-r from-cyan-glow/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12} className="mt-6">
            <a
              href="#link-notice"
              data-resource="syllabus"
              data-label="Полная программа курса"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mint hover:underline underline-offset-4"
            >
              Полная программа курса <ArrowUpRight className="size-3.5" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* =============================== LEARNING ============================ */}
      <section id="learning" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:py-32">
        <Reveal>
          <Kicker>формат</Kicker>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
            Как проходит обучение?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LEARNING.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <Panel className="h-full p-7">
                <s.icon className="size-5 text-mint" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-semibold text-ice">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mist">{s.body}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =============================== INTEGRAL ============================ */}
      <section id="integral" className="relative border-t border-edge/50 bg-hull/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl scroll-mt-20 px-5">
          <Reveal>
            <Kicker>инструмент</Kicker>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
              Что такое <span className="text-glow-mint text-mint">«Интеграл»</span>?
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
              Программный комплекс «Интеграл» разработан сотрудниками МФТИ — это инструмент для моделирования
              широкого спектра ситуаций: от продвинутой баллистики до расчёта периодичности наблюдения цели.
            </p>
            <a
              href="#link-notice"
              data-resource="integral"
              data-label="Программный комплекс «Интеграл»"
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mint hover:underline underline-offset-4"
            >
              Подробнее о программном комплексе <ArrowUpRight className="size-3.5" />
            </a>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {INTEGRAL_LABS.map((lab, i) => (
              <Reveal key={lab.src} delay={i * 0.08}>
                <Panel className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lab.src} alt={lab.label} className="aspect-video w-full object-cover" loading="lazy" />
                  <p className="border-t border-edge/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mist/80">
                    {lab.label}
                  </p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ MISSION ============================ */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
        <Reveal>
          <Kicker>миссия</Kicker>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {MISSION.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <Panel className="group h-full p-7">
                <s.icon className="size-5 text-cyan-glow transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-semibold text-ice">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mist">{s.body}</p>
              </Panel>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <Panel className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/satellite-blue.webp"
              alt="Спутник дистанционного зондирования Земли на орбите"
              className="aspect-[21/9] w-full object-cover"
              loading="lazy"
            />
          </Panel>
        </Reveal>
      </section>

      {/* ================================= FINAL ============================= */}
      <section id="final" className="relative border-t border-edge/50 bg-hull/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl scroll-mt-20 px-5">
          <Reveal>
            <Kicker>финал программы</Kicker>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
              Что вы получите
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden border border-edge/60 bg-edge/60 md:grid-cols-3">
            {FINAL.map((f, i) => (
              <Reveal key={f.text} delay={i * 0.07}>
                <div className="flex h-full flex-col gap-4 bg-hull p-7">
                  <f.icon className="size-5 text-mint" strokeWidth={1.5} />
                  <p className="text-sm leading-relaxed text-ghost">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== MATERIALS ============================ */}
      <section id="materials" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:py-32">
        <Reveal>
          <Kicker>материалы</Kicker>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
            Все материалы курса
          </h2>
        </Reveal>

        <Reveal className="mt-12">
          <Panel ticks={false}>
            <ul className="divide-y divide-edge/60">
              {MATERIALS.map((m, i) => (
                <li key={m.resource}>
                  <a
                    href="#link-notice"
                    data-resource={m.resource}
                    data-label={m.label}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-panel md:px-7"
                  >
                    <span className="font-mono text-[11px] text-mint/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[15px] font-medium text-ghost transition-colors group-hover:text-ice">{m.label}</span>
                    <ArrowUpRight className="ml-auto size-4 text-mist/50 transition-all group-hover:translate-x-0.5 group-hover:text-mint" strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </section>

      {/* ================================= FAQ =============================== */}
      <section id="faq" className="relative border-t border-edge/50 bg-hull/40 py-24 md:py-32">
        <div className="mx-auto max-w-4xl scroll-mt-20 px-5">
          <Reveal>
            <Kicker>faq</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
              Остались вопросы?
            </h2>
          </Reveal>

          <div className="mt-12 space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <details className="group panel-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-medium text-ghost transition-colors hover:text-ice [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <BookOpenCheck className="size-4 shrink-0 text-mint/60 transition-transform duration-300 group-open:rotate-12" strokeWidth={1.5} />
                  </summary>
                  <p className="border-t border-edge/60 px-5 py-4 text-sm leading-relaxed text-mist">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== CONTACT ============================= */}
      <section id="contact" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:py-32">
        <Reveal>
          <Panel className="relative overflow-hidden px-7 py-14 text-center md:py-20">
            <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/satellite-gold.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-20 [mask-image:linear-gradient(90deg,transparent,black_70%)]"
            />
            <div className="relative">
              <Kicker className="justify-center">приём на поток открыт</Kicker>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ice md:text-5xl">
                Готовы спроектировать свою <span className="text-glow-mint text-mint">космическую систему</span>?
              </h2>
              <a
                href="#link-notice"
                data-resource="registration"
                data-label="Регистрация на курс"
                className="group mt-9 inline-flex items-center gap-2 bg-mint px-8 py-3.5 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-abyss transition-shadow hover:shadow-[0_0_36px_rgba(61,245,166,0.5)]"
              >
                Зарегистрироваться
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </a>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-mist/60">
                Физтех-школа аэрокосмических технологий · МФТИ
              </p>
            </div>
          </Panel>
        </Reveal>
      </section>

      {/* ================================ FOOTER ============================== */}
      <footer className="border-t border-edge/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-8 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/50 md:flex-row md:items-center">
          <span>
            КАДРЫ ДЛЯ КОСМОСА <span className="text-mint">×</span> ФАКТ · МФТИ
          </span>
          <span>ДЗЗ · космическая связь</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 animate-blink rounded-full bg-mint" />
            Приём на поток открыт
          </span>
        </div>
      </footer>
    </main>
  );
}
