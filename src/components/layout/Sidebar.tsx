import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navItems } from "./nav";
import { useAuth } from "../../context/AuthContext";

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-cream-300 bg-white px-4 py-6 sm:flex">
      <div className="mb-8 px-2">
        <p className="font-display text-xl font-bold text-cocoa-700">After25 Cakes</p>
        <p className="text-xs text-cocoa-400">Home bakery tracker</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-blush-100 text-berry-600" : "text-cocoa-500 hover:bg-cream-200"
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-cream-200 pt-4">
        <p className="truncate px-2 text-xs text-cocoa-400">Signed in as {user?.username}</p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-cocoa-500 hover:bg-cream-200"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Log out
        </button>
      </div>
    </aside>
  );
}
