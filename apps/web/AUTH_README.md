# Form Login & Register - CekDulu

Saya telah membuat sistem autentikasi lengkap dengan form login dan register untuk aplikasi CekDulu.

## 📁 File yang Dibuat

### 1. **lib/auth.ts**
File utama untuk validasi dan API integration:
- `loginSchema` - Validasi untuk form login
- `registerSchema` - Validasi untuk form register (dengan konfirmasi password)
- `login()` - Function untuk submit login
- `register()` - Function untuk submit register
- `logout()` - Function untuk logout

### 2. **components/auth-form.tsx**
Komponen form reusable yang menangani:
- Rendering dinamis field input
- Validasi real-time dengan Zod
- Error handling untuk field individual & form level
- Loading state
- Redirect otomatis setelah success

### 3. **app/auth/layout.tsx**
Layout wrapper untuk auth pages dengan:
- Gradient background yang menarik
- Centered container
- Responsive design

### 4. **app/auth/login/page.tsx**
Halaman login dengan:
- 2 field: Email & Password
- Link ke halaman register
- Redirect ke `/dashboard` setelah login

### 5. **app/auth/register/page.tsx**
Halaman register dengan:
- 4 field: Nama, Email, Password, Confirm Password
- Link ke halaman login
- Validasi password match

### 6. **hooks/use-auth.ts**
Custom hook untuk manage auth state:
- Check token dari localStorage
- `useAuth()` untuk akses di komponen

### 7. **components/site-header.tsx** (Updated)
Updated header dengan:
- Link "Masuk" ke `/auth/login`
- Link "Daftar" ke `/auth/register`

## 🚀 Cara Menggunakan

### Menambahkan Auth ke Halaman
```tsx
'use client';

import { useAuth } from '@/hooks/use-auth';

export function ProtectedComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Silakan login terlebih dahulu</div>;
  }

  return (
    <div>
      <p>Selamat datang, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Akses Form
- **Login**: `/auth/login`
- **Daftar**: `/auth/register`

## 🔗 API Endpoints yang Diperlukan

Backend harus menyediakan endpoints:

```
POST /api/auth/login
Body: { email, password }
Response: { data: { token, user } }

POST /api/auth/register
Body: { name, email, password }
Response: { data: { token, user } }
```

## 🎨 Styling

- Menggunakan Tailwind CSS & component patterns yang sudah ada
- Konsisten dengan design system CekDulu (orange accent)
- Responsive di mobile, tablet, desktop
- Dengan error handling visual yang jelas

## ✅ Validasi Form

- **Email**: Valid email format
- **Password**: Minimal 6 karakter
- **Confirm Password**: Harus sesuai dengan password
- **Name**: Minimal 2 karakter
- Error message ditampilkan per field

## 📦 Dependencies yang Sudah Ada

- `zod` - Validasi form
- `next` - Framework
- Komponen UI yang sudah dibuat

---

Semua siap digunakan! Form sudah production-ready dengan error handling lengkap.
