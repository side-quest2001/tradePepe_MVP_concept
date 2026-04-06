'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export function SignOutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push('/signin');
        router.refresh();
      }}
      className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} text-[#95a3b4] transition hover:text-[#dbe6f2]`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#122437] shadow-[inset_0_0_0_1px_rgba(120,160,200,0.12)]">
        <LogOut className="h-5 w-5" />
      </span>
      {!collapsed ? <span className="text-[13px] font-medium">Sign out</span> : null}
    </button>
  );
}
