"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, MessageCircle, Dumbbell, User } from "lucide-react";

const tabs = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/words", label: "Words", icon: BookOpen },
  { href: "/phrases", label: "Phrases", icon: MessageCircle },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/auth") return null;
  return (
    <nav className="vk-tabbar">
      <div className="vk-sidebar-brand">Vokrub</div>
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={`vk-tab${active ? " is-on" : ""}`}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
