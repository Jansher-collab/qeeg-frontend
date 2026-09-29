"use client";

import { useEffect, useRef } from "react";

/**
 * Locks background scrolling while a portal modal is open and compensates for
 * the removed scrollbar so the page behind a modal never reflows, jitters, or
 * shifts horizontally when the modal opens or closes.
 *
 * Two complementary mechanisms:
 *  - `scrollbar-gutter: stable` on <html> (see app/globals.css) permanently
 *    reserves the classic-scrollbar gutter, so toggling `overflow: hidden`
 *    never changes the usable viewport width and causes no re-layout.
 *  - For browsers without gutter support, the consumed scrollbar width is
 *    re-added as `padding-right` on <body> while a modal is open.
 *
 * A reference counter keeps the lock balanced even if several modals open or
 * close within the same render cycle (e.g. payment failure -> retry), and the
 * unmount cleanup guarantees the body styles are always restored.
 */
const lockState = { count: 0, bodyOverflow: "", bodyPaddingRight: "" };

const supportsScrollbarGutter =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("scrollbar-gutter", "stable");

export function useModalScrollLock(isOpen: boolean) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (lockState.count === 0) {
        lockState.bodyOverflow = document.body.style.overflow;
        lockState.bodyPaddingRight = document.body.style.paddingRight;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        if (!supportsScrollbarGutter) {
          const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
          if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
          }
        }
      }
      lockState.count += 1;
    } else if (!isOpen && wasOpenRef.current) {
      lockState.count = Math.max(0, lockState.count - 1);
      if (lockState.count === 0) {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = lockState.bodyOverflow;
        document.body.style.paddingRight = lockState.bodyPaddingRight;
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        lockState.count = Math.max(0, lockState.count - 1);
        if (lockState.count === 0) {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = lockState.bodyOverflow;
          document.body.style.paddingRight = lockState.bodyPaddingRight;
        }
      }
    };
  }, []);
}