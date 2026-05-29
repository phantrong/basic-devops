import './globals.css';

export const metadata = {
  title: 'Basic App — Guestbook',
  description: 'Minimal Next.js + Node.js + MySQL demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
