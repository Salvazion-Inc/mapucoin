"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HScroll({
  children,
  labelPrev,
  labelNext,
  className = "",
}: {
  children: ReactNode;
  labelPrev: string;
  labelNext: string;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 4) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (moved > 8) {
        el.dataset.dragged = "1";
        window.setTimeout(() => {
          delete el.dataset.dragged;
        }, 40);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  function step(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    const child = el.firstElementChild as HTMLElement | null;
    const gap = 20;
    const amount = child ? child.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className={`rail-wrap ${className}`}>
      <div
        ref={scroller}
        className="rail"
        onClickCapture={(e) => {
          if (scroller.current?.dataset.dragged) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
      <button
        type="button"
        className="rail-nav rail-nav-prev"
        aria-label={labelPrev}
        onClick={() => step(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="rail-nav rail-nav-next"
        aria-label={labelNext}
        onClick={() => step(1)}
      >
        ›
      </button>
    </div>
  );
}
