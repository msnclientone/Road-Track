Gmail + OTP setup for Road Track

1) Choose transport method
- App Password (simpler): enable 2FA on the Gmail account, create an App Password and set `SMTP_USER` and `SMTP_PASS`.
- OAuth2 (recommended in production): create OAuth2 credentials and set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER`.

2) Environment variables
- App password (works with existing code):
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=you@gmail.com`
  - `SMTP_PASS=<app-password>`
  - `SMTP_FROM="Road Track <you@gmail.com>"`

- OAuth2 (optional):
  - `GMAIL_CLIENT_ID=...`
  - `GMAIL_CLIENT_SECRET=...`
  - `GMAIL_REFRESH_TOKEN=...`
  - `GMAIL_USER=you@gmail.com`

3) How to get a Gmail OAuth2 refresh token (brief)
- Option A: Use Google OAuth 2.0 Playground
  - Visit https://developers.google.com/oauthplayground
  - Select Gmail API scopes (e.g. `https://mail.google.com/`), authorize and exchange for tokens, copy the `refresh_token`.
- Option B: Use a small script with `googleapis` to perform OAuth2 authorization and save the refresh token.

4) Local testing
- In development the app prints OTPs to server logs when SMTP is not configured.
- To test email sending without Gmail, use Ethereal (nodemailer.createTestAccount()).

5) Database
- The Prisma model `OtpCode` already exists in `prisma/schema.prisma`.
- If you change the model, run:

```bash
npx prisma migrate dev --name add-otp
```

6) Security recommendations
- Do NOT store plaintext OTPs in DB (current implementation stores hashes).
- Use short TTL (5 minutes) and one-time use.
- Keep `AUTH_SECRET` and other secrets safe.

7) Debugging
- Check server logs for development OTP outputs.
- Verify SMTP connectivity by running a small Node snippet using `nodemailer`.

8) Helpful commands
```bash
# install deps if missing
npm install
# run dev
npm run dev
# run Prisma migrations
npx prisma migrate dev
```
