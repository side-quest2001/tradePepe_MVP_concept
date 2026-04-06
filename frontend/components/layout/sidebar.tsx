'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  BarChart3,
  Newspaper,
  CircleUserRound,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { SignOutButton } from '@/components/auth/signout-button';

const navItems: ReadonlyArray<{
  href: Route;
  icon: LucideIcon;
  label: string;
}> = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/community', icon: Newspaper, label: 'Community' },
  { href: '/profile', icon: CircleUserRound, label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const { user } = useAuth();

  return (
    <aside
      className={`h-full shrink-0 overflow-hidden border-r border-[#112131] bg-[#081523] transition-all duration-200 ${
        collapsed ? 'w-[88px]' : 'w-[220px]'
      }`}
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Top */}
        <div className="px-3 pb-3 pt-3">
          <div className={`flex items-start ${collapsed ? 'justify-between' : 'gap-3'}`}>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0d6c59] ring-1 ring-[#1b3a3d]">
              <Image
                src="https://i.imgur.com/6VBx3io.png"
                alt="Pepe"
                width={40}
                height={40}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>

            {!collapsed && (
              <div className="pt-1">
                <div className="text-[14px] font-semibold text-[#eef4fb]">TradePepe</div>
                <div className="text-[11px] text-[#7f8da1]">Trading Journal</div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className={`mt-1 flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#3b4b5c] bg-[#1d2a39] text-[#cbd5df] ${
                collapsed ? '' : 'ml-auto'
              }`}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-2">
          <div className="flex h-full min-h-0 flex-col border-t border-[#132435] pt-4">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center ${
                      collapsed ? 'justify-center' : 'gap-3 px-3'
                    }`}
                  >
                    {isActive ? (
                      <span
                        className={`absolute h-8 w-[4px] rounded-full bg-[#18c99f] ${
                          collapsed ? 'right-[2px]' : 'left-[2px]'
                        }`}
                      />
                    ) : null}

                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] transition ${
                        isActive
                          ? 'bg-[#0d6c59]/25 text-[#18d39a]'
                          : 'text-[#95a3b4] hover:bg-[#112131] hover:text-[#dbe6f2]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    {!collapsed && (
                      <span
                        className={`text-[13px] font-medium ${
                          isActive ? 'text-[#e8f3fb]' : 'text-[#95a3b4]'
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="mt-auto pb-5 pt-5">
              <div className="mx-1 mb-4 border-t border-[#213244]" />
              {!collapsed && user ? (
                <div className="mb-4 px-3">
                  <p className="text-[12px] font-semibold text-[#eef4fb]">{user.name}</p>
                  <p className="mt-1 text-[11px] text-[#7f8da1]">{user.handle}</p>
                </div>
              ) : null}
              <div className={`space-y-3 ${collapsed ? 'flex flex-col items-center' : 'px-3'}`}>
                <button
                  type="button"
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} text-[#95a3b4] transition hover:text-[#dbe6f2]`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#122437] shadow-[inset_0_0_0_1px_rgba(120,160,200,0.12)]">
                    <Settings2 className="h-5 w-5" />
                  </span>
                  {!collapsed ? <span className="text-[13px] font-medium">Settings</span> : null}
                </button>
                <SignOutButton collapsed={collapsed} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
