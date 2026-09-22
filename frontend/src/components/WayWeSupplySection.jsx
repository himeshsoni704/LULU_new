import { useRef, useState, useEffect } from "react";
import FoldingBox from "./FoldingBox";
import React from "react";

/* ─── 01 02 03 supply steps ─── */
const STEPS = [
  {
    num: "01",
    title: "One supplier. The full range.",
    text: "Corrugated products, boxes, tapes, protective films and accessories — the catalogue our customers rely on, all under one roof.",
  },
  {
    num: "02",
    title: "Rooted in Sharjah industry.",
    text: "Operating from Industrial Area #5 since 2013, close to the UAE's manufacturing and logistics corridors.",
  },
  {
    num: "03",
    title: "Supply built for business.",
    text: "Quotation-based B2B supply. Tell us the product, the size and the quantity — our team responds with a formal quotation.",
  },
];

/* ─── Error boundary for Three.js canvas ─── */
class BoxErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ─── Main section component ─── */
export default function WayWeSupplySection() {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* Drive the Three.js folding animation from scroll position */
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Start folding as section enters, fold faster so box completes when section is in view
      const start = rect.top - windowH * 0.75;
      const end = rect.top + rect.height * 0.45;
      const range = end - start;
      if (range <= 0) return;
      const rawProgress = (-start / range);
      const progress = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="grain bg-charcoal text-bone overflow-hidden"
      data-testid="way-we-supply-section"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-start">

          {/* ── LEFT: 01 02 03 ── */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-tape mb-4">
              Why Al Lulu
            </p>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl mb-14">
              The way<br />we supply
            </h2>

            <div className="divide-y divide-bone/10">
              {STEPS.map((s) => (
                <div key={s.num} className="flex items-start gap-8 py-9">
                  <span
                    className="font-display font-extrabold shrink-0 leading-none select-none"
                    style={{ fontSize: "clamp(3rem,5.5vw,4.2rem)", color: "rgba(248,246,240,0.08)" }}
                  >
                    {s.num}
                  </span>
                  <div className="flex-1 border-l-2 border-kraft pl-7">
                    <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone/60">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Three.js Folding Box + Promises ── */}
          <div className="flex flex-col items-center gap-10 lg:pt-16 lg:sticky lg:top-28">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-tape self-start lg:self-center">
              Promises we deliver
            </p>

            {/* Three.js folding box — scroll-driven */}
            <div
              style={{ width: "100%", height: 380, position: "relative" }}
              aria-hidden="true"
            >
              <BoxErrorBoundary>
                <FoldingBox
                  progress={scrollProgress}
                  autoRotate={true}
                  zoomLevel={1}
                  className="h-full w-full"
                />
              </BoxErrorBoundary>
            </div>

            {/* Promises Guarantee */}
            <div className="w-full max-w-md border-t border-b border-bone/12 py-4 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-bone/70">
                Sharjah Dispatch &bull; 24h Quotation &bull; Full-Range &bull; Quality Checked
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
