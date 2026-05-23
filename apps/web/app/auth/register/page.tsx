'use client';

import { AuthForm } from '@/components/auth-form';
import { registerSchema, register } from '@/lib/auth';

export default function RegisterPage() {
  return (
    <AuthForm
      type="register"
      schema={registerSchema}
      onSubmit={register}
      fields={[
        {
          name: 'name',
          label: 'Nama Lengkap',
          type: 'text',
          placeholder: 'Nama Anda'
        },
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
          placeholder: 'Minimal 6 karakter'
        },
        {
          name: 'confirmPassword',
          label: 'Konfirmasi Password',
          type: 'password',
          placeholder: 'Ulangi password Anda'
        }
      ]}
      submitButtonText="Daftar"
      footerText="Sudah punya akun?"
      footerLink="Masuk sekarang"
      footerLinkHref="/auth/login"
    />
  );
}
