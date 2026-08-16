import { NavLink } from "react-router-dom";
import { navItems } from "./nav";

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-cream-300 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Main navigation"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
              isActive ? "text-berry-500" : "text-cocoa-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 1.8} aria-hidden />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
