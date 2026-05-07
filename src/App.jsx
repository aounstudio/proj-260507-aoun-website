import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BLACK = "#000000";
const PAPER_SOFT = "#d8d4cb";
const PAPER_TEXT = "#2b2a27";

const NAV = [
  { id: "works", label: "WORKS" },
  { id: "build", label: "BUILD" },
  { id: "studio", label: "STUDIO" },
  { id: "apply", label: "APPLY" },
];

const IMAGES = {
  architecture:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2400&q=85",
  food:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2400&q=85",
  studio:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=85",
  black:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85",
  portrait:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85",
};

const works = [
  {
    title: "Datteldealer",
    meta: "COMMERCE / CULTURE / REBRAND",
    subtitle: "From product to cultural commerce brand.",
    result: "8× conversion rate in the launch window.",
    image: IMAGES.food,
  },
  {
    title: "Müller Media Group",
    meta: "TRUST / PRESENCE / POSITIONING",
    subtitle: "From person to trusted company presence.",
    result: "More weight. More trust. More commercial seriousness.",
    image: IMAGES.studio,
  },
  {
    title: "Redlion",
    meta: "PERSONAL BRAND / CULTURE / DIRECTION",
    subtitle: "From niche artist to cultural authority.",
    result: "Stronger identity beyond the immediate niche.",
    image: IMAGES.portrait,
  },
];

const editions = [
  {
    index: "01",
    title: "First Edition",
    label: "CONTROLLED BEGINNING",
    text: "The first market-ready version. Strong enough to be seen. Flexible enough to learn.",
  },
  {
    index: "02",
    title: "Market Edition",
    label: "SERIOUS MARKET PRESENCE",
    text: "The core build. For brands ready to enter the market with weight, desire and proof.",
  },
  {
    index: "03",
    title: "Scale Edition",
    label: "REPEATABLE SYSTEM",
    text: "For brands that must carry across locations, teams, partners or markets without losing force.",
  },
];

const formSteps = [
  "Name",
  "Company / Brand",
  "Website / Current Presence",
  "What are you building?",
  "Where is the value not being seen, trusted or desired enough?",
  "What is already in motion?",
  "Budget Range",
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navClass =
  "text-[11px] uppercase tracking-[0.22em] leading-none font-normal";
const micro =
  "text-[10px] uppercase tracking-[0.18em] leading-[1.18] font-normal";
const small =
  "text-[12px] md:text-[13px] tracking-[0.03em] leading-[1.28] font-normal";
const title = "font-thin leading-[0.95] tracking-[-0.035em]";

const fadeUp = {
  hidden: { opacity: 0, y: 8, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function getCurrentRoute() {
  if (typeof window === "undefined") return "home";
  return window.location.hash.replace("#", "") || "home";
}

function useHashRoute() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

const go = useCallback((id) => {
  if (typeof window === "undefined") return;

  const currentRoute = getCurrentRoute();

  if (currentRoute === id) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  window.location.hash = id === "home" ? "" : id;
  window.scrollTo({ top: 0, behavior: "auto" });
}, []);

  return { route, go };
}

function useHeavyScroll(route) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let raf = null;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const clamp = (value) => Math.max(0, Math.min(value, maxScroll()));

    const animate = () => {
      current += (target - current) * 0.078;
      window.scrollTo(0, current);

      if (Math.abs(target - current) < 0.35) {
        current = target;
        window.scrollTo(0, current);
        raf = null;
        return;
      }

      raf = requestAnimationFrame(animate);
    };

    const onWheel = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select", "option"].includes(tag)) return;

      event.preventDefault();
      target = clamp(target + event.deltaY * 0.82);

      if (!raf) raf = requestAnimationFrame(animate);
    };

    const onResize = () => {
      target = clamp(window.scrollY);
      current = target;
      ScrollTrigger.refresh();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [route]);
}

function PageShell({ children, pageKey }) {
  const wrapperRef = useRef(null);
  const timelineRef = useRef(null);
  const [pages, setPages] = useState([
    { key: pageKey, children, status: "current" },
  ]);

  useEffect(() => {
    setPages((currentPages) => {
      const currentPage = currentPages[currentPages.length - 1];

      if (!currentPage || currentPage.key === pageKey) {
        return currentPages;
      }

      return [
        { ...currentPage, status: "old" },
        { key: pageKey, children, status: "next" },
      ];
    });
  }, [children, pageKey]);

  useEffect(() => {
    if (pages.length !== 2 || !wrapperRef.current) return;

    const currentContainer = wrapperRef.current.querySelector(
      '[data-transition-status="old"]',
    );
    const nextContainer = wrapperRef.current.querySelector(
      '[data-transition-status="next"]',
    );

    if (!currentContainer || !nextContainer) return;

    if (timelineRef.current) timelineRef.current.kill();

    gsap.set(currentContainer, {
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100vh",
      overflow: "hidden",
      zIndex: 20,
      transformOrigin: "center top",
      force3D: true,
    });

    gsap.set(nextContainer, {
      clipPath: "inset(100% 0% 0% 0%)",
      opacity: 1,
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100vh",
      overflow: "hidden",
      zIndex: 30,
      transformOrigin: "center bottom",
      force3D: true,
    });

    const revealItems = nextContainer.querySelectorAll("[data-page-reveal]");

    timelineRef.current = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        gsap.set(nextContainer, {
          clearProps:
            "clipPath,position,inset,width,height,overflow,zIndex,transformOrigin,transform,opacity,filter,y,scale",
        });

        window.scrollTo(0, 0);
        setPages([{ key: pageKey, children, status: "current" }]);

        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      },
    });

    timelineRef.current
      .to(
        currentContainer,
        {
          y: "-22vh",
          opacity: 0.32,
          scale: 0.88,
          duration: 1.05,
          force3D: true,
        },
        0,
      )
      .to(
        nextContainer,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.05,
          force3D: true,
        },
        0,
      )
      .fromTo(
        revealItems,
        { opacity: 0, y: 10, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
        },
        0.48,
      );

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [pages, pageKey, children]);

  return (
    <div ref={wrapperRef} data-transition="wrapper">
      {pages.map((page) => (
        <div
          key={page.key}
          data-transition="container"
          data-transition-status={page.status}
        >
          {page.children}
        </div>
      ))}
    </div>
  );
}

function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      {children}
    </motion.div>
  );
}

function AounLogo({ tone = "light", className = "" }) {
  const fill = tone === "dark" ? "#171613" : "#f0f0eb";

  return (
    <svg
      className={className}
      width="61"
      height="10"
      viewBox="0 0 176 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AOUN"
    >
      <path
        d="M20.2788 28.2662L17.109 17.2627H7.92458L4.75475 28.2662H0L8.2497 0.358809H16.8651L25.0336 28.2662H20.2788ZM7.92458 17.2627H17.109L12.5168 1.3555L7.92458 17.2627Z"
        fill={fill}
      />
      <path
        d="M61.7081 28.625C54.5557 28.625 50.0854 24.3193 50.0854 16.7046V11.9204C50.0854 4.30571 54.5557 0 61.7081 0C68.8605 0 73.3308 4.30571 73.3308 11.9204V16.7046C73.3308 24.3193 68.8605 28.625 61.7081 28.625ZM54.6776 16.7046C54.6776 21.5684 56.9534 24.4389 61.7081 24.4389C66.5035 24.4389 68.7793 21.5684 68.7793 16.7046V11.9204C68.7793 7.01671 66.5035 4.26584 61.7081 4.26584C56.9534 4.26584 54.6776 7.01671 54.6776 11.9204V16.7046Z"
        fill={fill}
      />
      <path
        d="M112.409 28.625C105.745 28.625 101.599 24.718 101.599 18.2993V0.358809H106.192V18.2195C106.192 21.7678 107.736 24.4788 112.409 24.4788C117.164 24.4788 118.749 21.7678 118.749 18.2195V0.358809H123.301V18.2993C123.301 24.718 119.196 28.625 112.409 28.625Z"
        fill={fill}
      />
      <path
        d="M153.214 28.2662V0.358809H161.91L171.054 27.4688V0.358809H175.484V28.2662H166.584L157.643 1.3555V28.2662H153.214Z"
        fill={fill}
      />
    </svg>
  );
}

function Preloader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    let raf;
    let timeout;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);

      setCount(Math.round(progress * 100));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timeout = window.setTimeout(() => setDone(true), 260);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black text-[#d8d8d2]"
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-8 w-px overflow-hidden bg-white/10">
              <motion.div
                className="absolute bottom-0 left-0 w-px bg-[#d8d8d2]"
                initial={{ height: "0%" }}
                animate={{ height: `${count}%` }}
                transition={{ duration: 0.14 }}
              />
            </div>
            <p className={cx(navClass, "tabular-nums")}>{count}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ route, go }) {
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-start justify-between px-7 py-7 text-[#f0f0eb]">
          <button
            type="button"
            onClick={() => go("home")}
            aria-label="AOUN Home"
            className="pt-[1px]"
          >
            <AounLogo tone="light" className="h-[10px] w-auto" />
          </button>

          <nav className={cx("flex gap-8 text-[#f0f0eb]", navClass)}>
            {NAV.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => go(item.id)}
                className={cx(
                  "transition-opacity duration-500 hover:opacity-45",
                  route === item.id && "opacity-45",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <SocialLinks route={route} />
    </>
  );
}

function SocialLinks({ route }) {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.18],
    route === "home" ? [1, 1, 1] : [0, 0, 1],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.18],
    route === "home" ? [0, 0] : [10, 0],
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className={cx(
        "fixed bottom-7 right-7 z-40 hidden gap-5 text-[#f0f0eb] mix-blend-difference md:flex",
        navClass,
      )}
    >
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className="transition-opacity hover:opacity-50"
      >
        INSTAGRAM
      </a>
      <span>/</span>
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noreferrer"
        className="transition-opacity hover:opacity-50"
      >
        LINKEDIN
      </a>
    </motion.div>
  );
}

function CTA({ children, onClick, light = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "min-w-[180px] rounded-full px-8 py-2.5 text-center transition-opacity hover:opacity-65",
        "text-[10px] uppercase tracking-[0.2em] leading-none font-normal",
        light ? "bg-[#2d2b26] text-[#e8e6df]" : "bg-[#e8e6df] text-black",
      )}
    >
      {children}
    </button>
  );
}

function ParallaxMedia({ src, alt = "", className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.03, 1.08]);

  return (
    <div ref={ref} className={cx("overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="h-full w-full object-cover grayscale"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function Home({ go }) {
  return (
    <div className="bg-black text-[#d8d8d2]">
      <section className="relative flex min-h-screen items-center justify-center px-7 py-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 text-center"
        >
          <motion.h1
            data-page-reveal
            variants={fadeUp}
            className={cx(
              "mx-auto mb-6 max-w-[18ch] text-[38px] sm:max-w-[20ch] md:max-w-[22ch] md:text-[58px]",
              title,
            )}
            style={{ letterSpacing: "0.045em" }}
          >
            AOUN builds brands for value that must be seen, trusted and desired.
          </motion.h1>

          <motion.p
            data-page-reveal
            variants={fadeUp}
            className={cx("mx-auto max-w-[42ch] sm:max-w-[48ch] text-[#a6a59f]", small)}
          >
            FOR FOUNDERS AND COMPANIES WHO REFUSE TO STAY UNDERVALUED.
          </motion.p>
        </motion.div>

        <motion.div
          data-page-reveal
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute bottom-8 left-7 max-w-[40ch] text-[#8f8e88]"
        >
          <p className={cx(small, "uppercase tracking-[0.12em] leading-[1.38]")}>
            BRAND STUDIO FOR VISIONARIES WHO BUILD VALUE, DESIRE, AUTHORITY.
          </p>
        </motion.div>
      </section>

      <ProblemStatement />
      <DarkFeatureImage />
      <HollowMagnetic />
      <AounStatement />
      <MethodMinimal />
      <StackedWorks onSelect={() => go("works")} />
      <HorizontalBuild onOpen={() => go("build")} />
      <StudioStrip go={go} />
      <FinalCTA go={go} />
    </div>
  );
}

function ProblemStatement() {
  const rows = [
    ["Seen", "not desired"],
    ["Found", "not remembered"],
    ["Sold", "negotiated"],
    ["Value", "reduced to comparison"],
  ];

  return (
    <section className="bg-black px-7 py-32 text-[#d8d8d2] md:py-44">
      <div className="grid gap-20 md:grid-cols-4">
        <div className="md:col-span-1">
          <Reveal>
            <h2 className="text-[22px] font-normal tracking-[0.02em] md:text-[28px]">
              Value alone is not enough.
            </h2>
          </Reveal>
        </div>

        <div className="md:col-span-3">
          <div className="space-y-8">
            {rows.map(([a, b]) => (
              <Reveal key={a}>
                <div className="grid gap-6 md:grid-cols-2">
                  <p className="text-[18px] font-normal tracking-[0.03em] md:text-[24px]">
                    {a}
                  </p>
                  <p className={cx("text-[#76756e]", small, "uppercase")}>
                    {b}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DarkFeatureImage() {
  return (
    <section className="bg-black px-7 py-20">
      <Reveal>
        <div className="mx-auto max-w-[72vw] bg-white/[0.05] p-5 md:p-8">
          <ParallaxMedia
            src={IMAGES.architecture}
            alt="AOUN editorial placeholder"
            className="h-[58vh] md:h-[70vh]"
          />
        </div>
      </Reveal>
    </section>
  );
}

function HollowMagnetic() {
  return (
    <section className="bg-black px-7 py-32 text-[#d8d8d2] md:py-44">
      <div className="grid gap-20 md:grid-cols-2">
        <Reveal>
          <div className="min-h-[320px] bg-white/[0.035] p-5">
            <p className={cx("mb-20 text-[#77776f]", small, "uppercase")}>
              THE HOLLOW BRAND
            </p>
            <h2 className="mb-5 text-[28px] font-thin tracking-[-0.035em] md:text-[42px]">
              Die leere Marke.
            </h2>
            <p className={cx("text-[#77776f]", small, "uppercase")}>
              Visible. But without pull.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="min-h-[320px] bg-white/[0.06] p-5 text-[#d8d8d2]">
            <p className={cx("mb-20 text-[#77776f]", small, "uppercase")}>
              THE MAGNETIC BRAND
            </p>
            <h2 className="mb-5 text-[28px] font-thin tracking-[-0.035em] md:text-[42px]">
              Die anziehende Marke.
            </h2>
            <p className={cx("text-[#77776f]", small, "uppercase")}>
              Not only visible. Wanted.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AounStatement() {
  return (
    <section className="flex min-h-[88vh] items-end bg-black px-7 py-28 text-[#d8d8d2]">
      <div className="grid w-full gap-16 md:grid-cols-2">
        <Reveal>
          <h2 className="max-w-[14ch] text-[42px] font-thin leading-[0.95] tracking-[-0.035em] md:text-[104px]">
            AOUN forms value into presence.
          </h2>
        </Reveal>

        <Reveal>
          <p className="max-w-[18ch] self-end text-[28px] font-normal leading-[1] tracking-[0.03em] text-[#86857f] md:text-[56px]">
            Not louder. More desirable.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MethodMinimal() {
  const items = [
    "ESSENCE DECIDES.",
    "AURA CREATES DESIRE.",
    "IMPACT MAKES IT WORK.",
  ];

  return (
    <section className="bg-black px-7 py-32 text-[#d8d8d2] md:py-44">
      <Reveal>
        <h2 className="mb-24 text-[32px] font-thin tracking-[-0.035em] md:text-[56px]">
          Essence. Aura. Impact.
        </h2>
      </Reveal>

      <div className="mx-auto max-w-xl space-y-5">
        {items.map((item) => (
          <Reveal key={item}>
            <div className="bg-white/[0.035] p-5">
              <p className={cx(small, "uppercase tracking-[0.12em]")}>{item}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StackedWorks({ onSelect }) {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;

    if (!section || !wrapper) return;

    const cards = gsap.utils.toArray(
      wrapper.querySelectorAll("[data-stack-card]"),
    );

    if (!cards.length) return;

    const context = gsap.context(() => {
      cards.forEach((card, index) => {
        const content = card.querySelectorAll("[data-stack-reveal]");

        if (index !== 0) {
          gsap.set(card, { yPercent: 100 });
          gsap.set(content, { opacity: 0, y: 8, filter: "blur(8px)" });
        } else {
          gsap.set(content, { opacity: 1, y: 0, filter: "blur(0px)" });
        }
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${cards.length * 100}%`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      cards.forEach((card, index) => {
        const media = card.querySelector("[data-stack-media]");
        const nextCard = cards[index + 1];

        if (!nextCard) return;

        const nextMedia = nextCard.querySelector("[data-stack-media]");
        const nextContent = nextCard.querySelectorAll("[data-stack-reveal]");

        timeline.to(card, { scale: 0.92, borderRadius: "10px", duration: 1 });

        if (media) {
          timeline.to(media, { scale: 1.035, duration: 1 }, "<");
        }

        timeline.to(nextCard, { yPercent: 0, duration: 1 }, "<");

        if (nextMedia) {
          timeline.to(nextMedia, { scale: 1.025, duration: 1 }, "<");
        }

        if (nextContent.length) {
          timeline.to(
            nextContent,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              stagger: 0.035,
              duration: 0.22,
              ease: "power2.out",
            },
            "<0.74",
          );
        }
      });
    }, section);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-black text-[#d8d8d2]"
    >
      <div ref={wrapperRef} className="relative h-screen w-full overflow-hidden">
        {works.map((work, index) => (
          <StackGsapCard
            key={work.title}
            work={work}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function StackGsapCard({ work, index, onSelect }) {
  return (
    <button
      type="button"
      data-stack-card
      onClick={onSelect}
      className="absolute inset-0 h-screen w-full origin-top overflow-hidden bg-[#111] text-left"
      style={{ zIndex: index + 1 }}
    >
      <img
        data-stack-media
        src={work.image}
        alt={work.title}
        className="absolute inset-0 h-full w-full scale-[1.01] object-cover grayscale"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/42" />

      <div className="relative h-full px-5 pb-5 pt-24 text-[#d8d8d2] md:px-8 md:pb-8 md:pt-28">
        <div
          data-stack-reveal
          className={cx("flex justify-between text-[#aaa9a2]", small, "uppercase")}
        >
          <span>{work.meta}</span>
          <span>0{index + 1}</span>
        </div>

        <div className="absolute left-5 top-[66.666%] max-w-[calc(100%-2.5rem)] text-left md:left-8 md:max-w-[calc(100%-4rem)]">
          <h3
            data-stack-reveal
            className="mb-5 text-[36px] font-thin leading-[0.95] tracking-[0.03em] md:text-[82px]"
          >
            {work.title}
          </h3>
          <p
            data-stack-reveal
            className="max-w-[22ch] text-[22px] font-thin leading-[1.02] tracking-[0.03em] text-[#b8b8b0] md:text-[42px]"
          >
            {work.subtitle}
          </p>
          <p
            data-stack-reveal
            className={cx("mt-8 max-w-[36ch] text-[#aaa9a2] uppercase", small)}
          >
            {work.result}
          </p>
        </div>
      </div>
    </button>
  );
}

function HorizontalBuild({ onOpen }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-300vw"]);
  const leadX = useTransform(scrollYProgress, [0, 1], ["0vw", "-18vw"]);

  return (
    <section ref={ref} className="relative h-[460vh] bg-black text-[#d8d8d2]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{ x: leadX }}
          className="pointer-events-none absolute left-7 top-24 z-20"
        >
          <h2 className="text-[38px] font-thin tracking-[-0.035em] md:text-[64px]">
            AOUN Build
          </h2>
        </motion.div>

        <motion.div style={{ x }} className="flex h-full w-[400vw]">
          <BuildIntroPanel onOpen={onOpen} />

          {editions.map((edition) => (
            <BuildEditionPanel
              key={edition.title}
              edition={edition}
              onOpen={onOpen}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BuildIntroPanel({ onOpen }) {
  return (
    <div className="flex h-screen w-screen flex-col justify-end px-7 py-24">
      <div className="grid gap-10 md:grid-cols-4">
        <p className={cx("max-w-[30ch] text-[#a09f98]", small, "uppercase")}>
          THE GUIDED BRAND BUILD. FROM CONTROLLED BEGINNING TO REPEATABLE SYSTEM.
        </p>
        <div className="md:text-right">
          <CTA onClick={onOpen}>DISCOVER BUILD</CTA>
        </div>
      </div>
    </div>
  );
}

function BuildEditionPanel({ edition, onOpen }) {
  return (
    <div className="flex h-screen w-screen flex-col justify-between px-7 py-24 pt-44">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.24, delayChildren: 0.02 } },
        }}
        className={cx("flex justify-between text-[#8c8b85]", small, "uppercase")}
      >
        <motion.span variants={fadeUp}>{edition.index}</motion.span>
        <motion.span variants={fadeUp}>{edition.label}</motion.span>
      </motion.div>

      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <h3 className="max-w-[12ch] text-[52px] font-thin leading-[0.95] tracking-[-0.035em] md:text-[118px]">
            {edition.title}
          </h3>
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.26, delayChildren: 0.04 } },
        }}
        className="grid gap-10 md:grid-cols-4"
      >
        <motion.p
          variants={fadeUp}
          className={cx("max-w-[34ch] text-[#a09f98]", small, "uppercase")}
        >
          {edition.text}
        </motion.p>

        <motion.div variants={fadeUp} className="md:text-right">
          <CTA onClick={onOpen}>BUILD YOUR EDITION</CTA>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StudioStrip({ go }) {
  return (
    <section className="bg-black px-7 py-32 text-[#d8d8d2] md:py-44">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="hidden md:col-span-4 md:block" />

        <div className="md:col-span-8">
          <Reveal>
            <h2 className="mb-12 text-[40px] font-thin leading-[0.95] tracking-[0.03em] md:text-[86px]">
              A guiding hand.
            </h2>
          </Reveal>

          <Reveal>
            <p className="mb-12 max-w-[30ch] text-[22px] font-normal leading-[1.02] tracking-[0.03em] text-[#8a8982] md:text-[44px]">
              AOUN is not a consultant collecting options. AOUN recognizes value,
              sets direction and shapes desire.
            </p>
          </Reveal>

          <CTA onClick={() => go("studio")}>ENTER</CTA>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ go }) {
  return (
    <section className="flex min-h-screen flex-col justify-between bg-black px-7 py-24 text-[#d8d8d2]">
      <div />

      <Reveal>
        <h2 className="max-w-[12ch] text-[48px] font-thin leading-[0.95] tracking-[0.03em] md:text-[118px]">
          Show us what you are building.
        </h2>
      </Reveal>

      <div>
        <p className={cx("mb-8 text-[#8a8982]", small, "uppercase")}>
          NOT WHAT YOU ARE IMAGINING.
        </p>
        <CTA onClick={() => go("apply")}>SUBMIT</CTA>
      </div>
    </section>
  );
}

function SubPage({ children }) {
  return <div className="bg-[#e8e6df] text-[#2b2a27]">{children}</div>;
}

function PageHero({ title, children }) {
  return (
    <section className="flex min-h-screen flex-col justify-between px-7 pb-8 pt-24">
      <motion.h1
        data-page-reveal
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-[44px] font-thin leading-[0.96] tracking-[0.04em] md:text-[90px]"
      >
        {title}
      </motion.h1>

      <motion.div
        data-page-reveal
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid gap-8 md:grid-cols-4 md:items-end"
      >
        {children}
      </motion.div>
    </section>
  );
}

function Build({ go }) {
  return (
    <SubPage>
      <PageHero title="AOUN Build">
        <p className="text-[22px] font-normal leading-[1] tracking-[0.03em] md:text-[42px]">
          The guided brand build.
        </p>

        <p className={cx("max-w-[34ch] text-[#69665f] md:col-start-3", small, "uppercase")}>
          FOR COMPANIES, PRODUCTS AND CONCEPTS THAT DO NOT SIMPLY NEED BETTER
          DESIGN. THEY NEED STRONGER EFFECT.
        </p>

        <div className="md:text-right">
          <CTA light onClick={() => go("apply")}>
            APPLY
          </CTA>
        </div>
      </PageHero>

      <BuildSolves />
      <BuildImage />
      <BuildEditionsGrid />
      <ProcessBlock />
      <FinalCTA go={go} />
    </SubPage>
  );
}

function BuildSolves() {
  const items = [
    "TOO LITTLE DESIRE",
    "TOO MUCH EXPLANATION",
    "TOO MUCH COMPARABILITY",
    "TOO LITTLE GRAVITY",
  ];

  return (
    <section className="px-7 py-32 md:py-44">
      <div className="grid gap-20 md:grid-cols-4">
        <h2 className="text-[24px] font-normal tracking-[0.03em] md:text-[36px]">
          When value exists, but the brand does not carry it.
        </h2>

        <div className="space-y-4 md:col-span-3">
          {items.map((item) => (
            <Reveal key={item}>
              <div className="bg-[#d8d4cb] p-5">
                <p className={cx(small, "uppercase")}>{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildImage() {
  return (
    <section className="bg-[#e8e6df] px-7 py-20">
      <Reveal>
        <div className="mx-auto max-w-[72vw] bg-[#d8d4cb] p-5 md:p-8">
          <ParallaxMedia
            src={IMAGES.black}
            alt="Build visual"
            className="h-[58vh] md:h-[70vh]"
          />
        </div>
      </Reveal>
    </section>
  );
}

function BuildEditionsGrid() {
  return (
    <section className="px-7 py-32 md:py-44">
      <h2 className="mb-20 text-[32px] font-normal tracking-[0.03em] md:text-[64px]">
        Three stages. One build.
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {editions.map((edition) => (
          <Reveal key={edition.title}>
            <div className="flex min-h-[420px] flex-col justify-between bg-[#d8d4cb] p-5">
              <div className={cx("flex justify-between text-[#77736a]", micro)}>
                <span>{edition.index}</span>
                <span>{edition.label}</span>
              </div>

              <div>
                <h3 className="mb-8 text-[32px] font-normal leading-[0.95] tracking-[0.03em] md:text-[54px]">
                  {edition.title}
                </h3>

                <p className={cx("text-[#69665f]", small, "uppercase")}>
                  {edition.text}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProcessBlock() {
  const steps = ["DIAGNOSIS", "DIRECTION", "FORM", "APPLICATION", "HANDOVER"];

  return (
    <section className="px-7 py-32 md:py-44">
      <div className="grid gap-20 md:grid-cols-4">
        <h2 className="text-[24px] font-normal tracking-[0.03em] md:text-[36px]">
          Guided from the beginning.
        </h2>

        <div className="space-y-4 md:col-span-3">
          {steps.map((item, index) => (
            <Reveal key={item}>
              <div className="flex justify-between bg-[#d8d4cb] p-5">
                <span className={cx(small, "uppercase")}>{item}</span>
                <span className={cx("text-[#77736a]", micro)}>
                  0{index + 1}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Works({ go }) {
  return (
    <SubPage>
      <PageHero title="Works">
        <p className="text-[22px] font-normal leading-[1] tracking-[0.03em] md:text-[42px]">
          Not a gallery. Interventions.
        </p>

        <p className={cx("max-w-[34ch] text-[#69665f] md:col-start-3", small, "uppercase")}>
          AOUN SHOWS SHIFTS IN PERCEPTION, VALUE AND EFFECT.
        </p>

        <div className="md:text-right">
          <CTA light onClick={() => go("apply")}>
            SUBMIT
          </CTA>
        </div>
      </PageHero>

      <StackedWorks onSelect={() => go("apply")} />
      <FinalCTA go={go} />
    </SubPage>
  );
}

function Studio({ go }) {
  return (
    <SubPage>
      <PageHero title="Studio">
        <p className="text-[22px] font-normal leading-[1] tracking-[0.03em] md:text-[42px]">
          A leading instance.
        </p>

        <p className={cx("max-w-[34ch] text-[#69665f] md:col-start-3", small, "uppercase")}>
          FOR VALUE, TASTE AND EFFECT.
        </p>

        <div className="md:text-right">
          <CTA light onClick={() => go("apply")}>
            SUBMIT
          </CTA>
        </div>
      </PageHero>

      <section className="bg-[#e8e6df] px-7 py-20">
        <Reveal>
          <div className="mx-auto max-w-[72vw] bg-[#d8d4cb] p-5 md:p-8">
            <ParallaxMedia
              src={IMAGES.studio}
              alt="Studio visual"
              className="h-[58vh] md:h-[70vh]"
            />
          </div>
        </Reveal>
      </section>

      <section className="px-7 py-32 md:py-44">
        <div className="grid gap-20 md:grid-cols-4">
          <h2 className="text-[24px] font-normal tracking-[0.03em] md:text-[36px]">
            No options. Direction.
          </h2>

          <div className="space-y-4 md:col-span-3">
            {[
              "AOUN IS NOT A CONSULTANT COLLECTING OPTIONS.",
              "AOUN RECOGNIZES VALUE.",
              "AOUN SETS DIRECTION.",
              "AOUN SHAPES DESIRE.",
            ].map((item) => (
              <Reveal key={item}>
                <div className="bg-[#d8d4cb] p-5">
                  <p className={cx(small, "uppercase")}>{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA go={go} />
    </SubPage>
  );
}

function Apply() {
  const [step, setStep] = useState(0);
  const isLast = step === formSteps.length - 1;

  const handleNext = () => {
    if (!isLast) setStep((current) => Math.min(current + 1, formSteps.length - 1));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  return (
    <SubPage>
      <PageHero title="Apply">
        <p className="text-[22px] font-normal leading-[1] tracking-[0.03em] md:text-[42px]">
          Show us what you are building.
        </p>

        <p className={cx("max-w-[34ch] text-[#69665f] md:col-start-3", small, "uppercase")}>
          NOT WHAT YOU ARE IMAGINING.
        </p>
      </PageHero>

      <section className="min-h-screen px-7 py-24">
        <div className="mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-between bg-[#d8d4cb] p-6 text-[#2b2a27] md:p-10">
          <div className={cx("flex justify-between text-[#77736a]", micro)}>
            <span>SUBMIT YOUR VISION</span>
            <span>
              {String(step + 1).padStart(2, "0")} /{" "}
              {String(formSteps.length).padStart(2, "0")}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              data-page-reveal
              key={formSteps[step]}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <label>
                <span className="mb-12 block text-[28px] font-normal leading-[1] tracking-[0.03em] md:text-[56px]">
                  {formSteps[step]}
                </span>

                {step === formSteps.length - 1 ? (
                  <select className={cx("w-full bg-[#c7c3ba] p-5 text-[#2b2a27] outline-none", small)}>
                    <option>10k–20k</option>
                    <option>20k–40k</option>
                    <option>40k–75k</option>
                    <option>75k+</option>
                  </select>
                ) : step > 2 ? (
                  <textarea
                    rows={4}
                    className={cx("w-full bg-[#c7c3ba] p-5 text-[#2b2a27] outline-none", small)}
                  />
                ) : (
                  <input className={cx("w-full bg-[#c7c3ba] p-5 text-[#2b2a27] outline-none", small)} />
                )}
              </label>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between">
            <button
              type="button"
              className={cx("text-[#77736a] disabled:opacity-20", micro)}
              disabled={step === 0}
              onClick={handleBack}
            >
              BACK
            </button>

            <button
              type="button"
              className={cx("rounded-full bg-[#2b2a27] px-5 py-3 text-[#e8e6df]", micro)}
              onClick={handleNext}
            >
              {isLast ? "SUBMIT" : "NEXT"}
            </button>
          </div>
        </div>
      </section>
    </SubPage>
  );
}

export default function AounWebsitePrototype() {
  const { route, go } = useHashRoute();
  useHeavyScroll(route);

  const page = useMemo(() => {
    switch (route) {
      case "works":
        return <Works go={go} />;
      case "build":
        return <Build go={go} />;
      case "studio":
        return <Studio go={go} />;
      case "apply":
        return <Apply />;
      default:
        return <Home go={go} />;
    }
  }, [route, go]);

  return (
    <div className="min-h-screen bg-black text-black antialiased selection:bg-black selection:text-[#e8e6df]">
      <style>{`
        html { background: ${BLACK}; }
        body {
          margin: 0;
          background: ${BLACK};
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-weight: 400;
        }
        h1, h2, h3 { font-weight: 100 !important; letter-spacing: -0.035em; }
        * { box-sizing: border-box; }
        button, input, textarea, select { font: inherit; }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
        img { content-visibility: auto; }
        select option { background: ${PAPER_SOFT}; color: ${PAPER_TEXT}; }
      `}</style>

      <Preloader />
      <Header route={route} go={go} />
      <PageShell pageKey={route}>{page}</PageShell>
    </div>
  );
}