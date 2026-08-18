import { useEffect, useRef } from "react";

/**
 * All currently-open sheets/menus share ONE history entry and ONE stack,
 * rather than each pushing its own. Two independent per-sheet entries proved
 * unreliable: closing one sheet calls `history.back()` to consume its own
 * entry, but a sibling opening in the very same click (e.g. an overflow
 * menu's "Edit" action closes the menu and opens the edit sheet at once)
 * pushes its own entry moments later — and the two calls could race, leaving
 * the "just opened" sheet closed again.
 *
 * Instead: pushing only happens when the shared stack goes from empty to
 * non-empty, and consuming that one entry only happens after a same-tick
 * sibling has had a chance to add itself back. That check is deferred with
 * `setTimeout`, not `queueMicrotask` — React flushes a newly-mounted
 * sibling's passive effect on a later macrotask-ish tick, not a microtask,
 * so checking too early would see an empty stack before that sibling joins.
 * A real back-button press closes everything currently on the stack,
 * deepest first — one "back" exits the whole modal chain, which is simpler
 * and far more robust than trying to peel off exactly one layer at a time.
 */
interface StackEntry {
  id: number;
  onClose: () => void;
}

const stack: StackEntry[] = [];
let idCounter = 0;
let listenerAttached = false;

function ensureGlobalListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener("popstate", () => {
    while (stack.length > 0) {
      const top = stack.pop();
      top?.onClose();
    }
  });
}

export function useCloseOnBack(open: boolean, onClose: () => void): void {
  const idRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    ensureGlobalListener();
    const id = ++idCounter;
    idRef.current = id;
    const wasEmpty = stack.length === 0;
    stack.push({ id, onClose: () => onCloseRef.current() });
    if (wasEmpty) {
      window.history.pushState({ __sheetSession: true }, "");
    }

    return () => {
      const index = stack.findIndex((entry) => entry.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
        setTimeout(() => {
          if (stack.length === 0) {
            window.history.back();
          }
        }, 0);
      }
      idRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
