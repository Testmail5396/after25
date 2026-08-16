import { useEffect, useRef } from "react";

/**
 * While `open`, pushes a throwaway history entry so the device/browser back
 * action closes this sheet/menu instead of navigating away from the page.
 * If the sheet is closed via its own UI (not the back button), the
 * throwaway entry is silently consumed with history.back().
 */
export function useCloseOnBack(open: boolean, onClose: () => void): void {
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ __sheet: true }, "");
    pushedRef.current = true;

    const handlePopState = () => {
      pushedRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
