import { useEffect, useRef } from "react";

let sheetIdCounter = 0;

/**
 * While `open`, pushes a throwaway history entry so the device/browser back
 * action closes this sheet/menu instead of navigating away from the page.
 * If the sheet is closed via its own UI (not the back button), the
 * throwaway entry is silently consumed with history.back().
 *
 * When one sheet opens another in the same tick (e.g. an overflow menu's
 * "Edit" action closes the menu and opens the edit sheet at once), both
 * instances' effects can commit in either order. Each pushed entry is
 * tagged with a unique id so cleanup only calls history.back() when its
 * own entry is still the current one — otherwise a later sheet's fresh
 * push would get popped by an earlier sheet's stale cleanup, closing the
 * sheet that was just opened.
 */
export function useCloseOnBack(open: boolean, onClose: () => void): void {
  const idRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const id = ++sheetIdCounter;
    idRef.current = id;
    window.history.pushState({ __sheetId: id }, "");

    const handlePopState = () => {
      idRef.current = null;
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      const stillCurrent = idRef.current !== null && (window.history.state as { __sheetId?: number } | null)?.__sheetId === id;
      idRef.current = null;
      if (stillCurrent) {
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
