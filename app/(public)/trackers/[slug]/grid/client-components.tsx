"use client";

import { useEffect, useRef } from "react";

export function ResponsiveTableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollLeft = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;

      const currentScrollLeft = container.scrollLeft;

      // Only update the data attribute if scroll position has changed significantly
      if (Math.abs(currentScrollLeft - lastScrollLeft.current) > 10) {
        lastScrollLeft.current = currentScrollLeft;

        // Add a data attribute to the container when scrolling horizontally
        if (currentScrollLeft > 10) {
          container.setAttribute("data-scrolling", "true");
        } else {
          container.setAttribute("data-scrolling", "false");
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="max-h-[70vh] overflow-y-auto group"
      data-scrolling="false"
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
