'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@nubase/ui';
import { apiFetch, type ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function AccountPage() {
  const router = useRouter();
  const { user, platformKey, hasHydrated } = useSession();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!platformKey) router.replace('/login');
  }, [hasHydrated, platformKey, router]);

  if (!hasHydrated) return null;
  if (!user) return null;

  return (
    <div className="w-full max-w-2xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Your platform user profile.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Identity used when calling the platform API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Full name" value={user.fullName || '—'} />
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-xs text-muted-foreground">Role</span>
            <div>
              {user.role === 'super_admin' ? (
                <Badge variant="success">super admin</Badge>
              ) : (
                <Badge variant="outline">user</Badge>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {user.role === 'super_admin'
                  ? 'You can see every project in this workspace.'
                  : 'You can only see projects you own or were invited to.'}
              </p>
            </div>
          </div>
          <Row label="User ID" value={user.id} mono />
        </CardContent>
      </Card>

      <ChangePasswordCard bearer={platformKey} />
    </div>
  );
}

function ChangePasswordCard({ bearer }: { bearer: string | null }) {
  // 'form' collects passwords; 'code' is shown after a code has been emailed.
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await apiFetch('/auth/v1/platform/password/otp', {
        method: 'POST',
        bearer: bearer ?? undefined,
        body: { currentPassword },
      });
      setStep('code');
      setNotice('We emailed you a 6-digit confirmation code.');
    } catch (err) {
      setError(parseError(err as ApiError) ?? 'Could not start the password change.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmChange(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/auth/v1/platform/password', {
        method: 'POST',
        bearer: bearer ?? undefined,
        body: { currentPassword, newPassword, code },
      });
      setStep('form');
      setCurrentPassword('');
      setNewPassword('');
      setCode('');
      setNotice('Password updated.');
    } catch (err) {
      setError(parseError(err as ApiError) ?? 'Could not change the password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Security</CardTitle>
        <CardDescription>
          Change your password. We email a confirmation code to verify it&apos;s you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'form' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            {notice ? <p className="text-xs text-muted-foreground">{notice}</p> : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending code…' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={confirmChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwCode">Confirmation code</Label>
              <Input
                id="pwCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {notice ? <p className="text-xs text-muted-foreground">{notice}</p> : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || code.length < 6}>
                {loading ? 'Updating…' : 'Change password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('form');
                  setCode('');
                  setError(null);
                  setNotice(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
    </div>
  );
}

function parseError(err: ApiError): string | null {
  try {
    const parsed = JSON.parse(err.message);
    return parsed?.message ?? null;
  } catch {
    return err.message;
  }
}
