'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, FolderGit2, ShieldCheck, Settings } from 'lucide-react';
import { cn } from '@nubase/ui';
import { useSession, isSuperAdmin } from '@/lib/session';
import { ThemeToggle } from './theme-toggle';

export function UserMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  const superAdmin = isSuperAdmin(user);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  if (!user) return null;

  function handleSignOut() {
    setOpen(false);
    signOut();
    router.replace('/login');
  }

  const initials = (user.fullName || user.email).slice(0, 2).toUpperCase();

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <ThemeToggle />
      <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold uppercase shadow-sm transition-opacity hover:opacity-90"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={user.email}
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl shadow-slate-950/10"
        >
          <div className="border-b border-border bg-muted/35 px-3 py-2.5 text-xs">
            <div className="font-semibold">{user.fullName ?? 'Signed in'}</div>
            <div className="truncate text-muted-foreground">{user.email}</div>
          </div>
          <MenuLink href="/projects" icon={FolderGit2} onClick={() => setOpen(false)}>
            All projects
          </MenuLink>
          <MenuLink href="/account" icon={User} onClick={() => setOpen(false)}>
            Account
          </MenuLink>
          {superAdmin ? (
            <>
              <MenuLink href="/admin/users" icon={ShieldCheck} onClick={() => setOpen(false)}>
                Platform users
              </MenuLink>
              <MenuLink href="/admin/settings" icon={Settings} onClick={() => setOpen(false)}>
                Platform settings
              </MenuLink>
            </>
          ) : null}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-accent"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-accent"
      role="menuitem"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
