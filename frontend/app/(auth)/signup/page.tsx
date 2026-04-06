import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

export default async function SignUpPage() {
  const cookieStore = await cookies();
  if (cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) {
    redirect('/dashboard');
  }

  return <AuthForm mode="signup" />;
}
