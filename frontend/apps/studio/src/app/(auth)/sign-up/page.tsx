'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@nubase/ui';
import { apiFetch, type ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';

interface PlatformAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; full_name?: string | null; role?: string | null };
}

interface PendingResponse {
  verification_required: true;
  email: string;
}

type SignUpResult = PlatformAuthResponse | PendingResponse;

function isPending(r: SignUpResult): r is PendingResponse {
  return (r as PendingResponse).verification_required === true;
}

interface PlatformConfig {
  signup_enabled: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const setAuth = useSession((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupEnabled, setSignupEnabled] = useState<boolean | null>(null);

  // When set, the account exists but needs an emailed code to finish.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PlatformConfig>('/auth/v1/platform/config')
      .then((c) => setSignupEnabled(c.signup_enabled))
      .catch(() => setSignupEnabled(true)); // permissive on fetch failure — server will still enforce
  }, []);

  function completeLogin(res: PlatformAuthResponse) {
    setAuth({
      platformKey: res.access_token,
      user: {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name ?? null,
        role: res.user.role ?? null,
      },
    });
    router.push('/projects');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<SignUpResult>('/auth/v1/platform/signup', {
        method: 'POST',
        body: { email, password, fullName: fullName || undefined },
      });
      if (isPending(res)) {
        setPendingEmail(res.email);
        setNotice(`We sent a 6-digit code to ${res.email}.`);
      } else {
        completeLogin(res);
      }
    } catch (err) {
      setError(parseError(err as ApiError) ?? 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<PlatformAuthResponse>('/auth/v1/platform/verify-email', {
        method: 'POST',
        body: { email: pendingEmail, code },
      });
      completeLogin(res);
    } catch (err) {
      setError(parseError(err as ApiError) ?? 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    setNotice(null);
    try {
      await apiFetch('/auth/v1/platform/verify-email/resend', {
        method: 'POST',
        body: { email: pendingEmail },
      });
      setNotice('A new code is on its way.');
    } catch {
      setNotice('A new code is on its way.');
    }
  }

  if (signupEnabled === false) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign-ups are closed</h1>
          <p className="text-sm text-muted-foreground">
            This workspace doesn&apos;t accept public sign-ups. Ask an existing super admin to invite
            you via the project members or platform users page.
          </p>
        </div>
        <Link href="/login" className="inline-block">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  if (pendingEmail) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Confirm your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we emailed to <span className="font-medium">{pendingEmail}</span>.
          </p>
        </div>
        <form onSubmit={onVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
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
          <Button type="submit" disabled={loading || code.length < 6} className="w-full">
            {loading ? 'Verifying…' : 'Verify & continue'}
          </Button>
        </form>
        <button
          type="button"
          onClick={onResend}
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Didn&apos;t get it? Resend code
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create your Studio account</h1>
        <p className="text-sm text-muted-foreground">
          Platform admin access to manage all your nubase projects.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
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
