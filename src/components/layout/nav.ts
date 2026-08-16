import { LayoutDashboard, ShoppingBag, Wallet, Users, Menu } from "lucide-react";

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sales", label: "Sales", icon: ShoppingBag },
  { to: "/purchases", label: "Purchases", icon: Wallet },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/more", label: "More", icon: Menu },
];
