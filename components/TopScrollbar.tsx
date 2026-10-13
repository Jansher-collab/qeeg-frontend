"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a slim horizontal scrollbar directly ABOVE the next sibling element,
 * which is expected to be the `overflow-x-auto` wrapper of a wide table.
 *
 * The native scrollbar on a wide table sits at the very bottom, so users do not
 * realise the table scrolls horizontally until they reach the end of the rows.
 * This component mirrors that scrollbar at the top and keeps the two in sync so
 * either one scrolls the table. It collapses to nothing when the table fits, so
 * it never leaves an empty strip above non-overflowing tables.
 *
 * Usage: place `<TopScrollbar />` immediately before the `overflow-x-auto` div.
 */
export default function TopScrollbar() {
  const barRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const scroller = bar?.nextElementSibling as HTMLElement | null;
    if (!bar || !scroller) return;

    let frame = 0;

    const measure = () => {
      const scrollWidth = scroller.scrollWidth;
      if (spacerRef.current) spacerRef.current.style.width = `${scrollWidth}px`;
      setOverflowing(scrollWidth - scroller.clientWidth > 1);
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(scroller);
      const content = scroller.firstElementChild;
      if (content) resizeObserver.observe(content);
    }

    const syncFromScroller = () => {
      if (bar.scrollLeft !== scroller.scrollLeft) {
        bar.scrollLeft = scroller.scrollLeft;
      }
    };

    const syncFromBar = () => {
      if (scroller.scrollLeft !== bar.scrollLeft) {
        scroller.scrollLeft = bar.scrollLeft;
      }
    };

    scroller.addEventListener("scroll", syncFromScroller, { passive: true });
    bar.addEventListener("scroll", syncFromBar, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      scroller.removeEventListener("scroll", syncFromScroller);
      bar.removeEventListener("scroll", syncFromBar);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      tabIndex={-1}
      data-top-scrollbar
      className={`overflow-x-auto overflow-y-hidden bg-slate-50/70 ${
        overflowing ? "h-3" : "hidden"
      }`}
    >
      <div ref={spacerRef} className="h-px" />
    </div>
  );
}
