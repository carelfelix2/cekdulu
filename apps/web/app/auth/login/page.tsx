'use client';

import { AuthForm } from '@/components/auth-form';
import { loginSchema, login } from '@/lib/auth';

export default function LoginPage() {
  return (
    <AuthForm
      type="login"
      schema={loginSchema}
      onSubmit={login}
      fields={[
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'nama@example.com'
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Masukkan password Anda'
        }
      ]}
      submitButtonText="Masuk"
      footerText="Belum punya akun?"
      footerLink="Daftar sekarang"
      footerLinkHref="/auth/register"
    />
  );
}
