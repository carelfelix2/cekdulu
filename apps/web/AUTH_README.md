# Auth & Panels CekDulu

## Demo account

- Admin: admin@cekdulu.test / Admin12345!
- User: user@cekdulu.test / User12345!

## Route penting

- Login: /auth/login
- Register: /auth/register
- Admin panel: /admin
- User panel: /dashboard

## Backend response

Login dan register sekarang mengembalikan:

- user
- accessToken
- refreshToken

Role routing:

- ADMIN / SUPER_ADMIN -> /admin
- USER -> /dashboard
