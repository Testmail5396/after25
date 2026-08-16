/** Height of the fixed mobile bottom nav (excluding safe-area inset), in px. */
export const BOTTOM_NAV_HEIGHT = 64;

/** Tailwind bottom-offset for a FAB: above the nav, plus a comfortable gap. */
export const FAB_BOTTOM = "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] sm:bottom-6";

/**
 * AppShell's <main> already reserves pb-24 (mobile) / pb-10 (desktop) to
 * clear the fixed bottom nav for plain pages. These are *additional*
 * mobile-only bottom padding a page should stack on top of that when it
 * also has a floating action button or bottom action dock, so the last
 * list item never sits behind them.
 */
export const PAGE_BOTTOM_PADDING_FAB = "pb-16 sm:pb-0";
export const PAGE_BOTTOM_PADDING_DOCK = "pb-24 sm:pb-0";
