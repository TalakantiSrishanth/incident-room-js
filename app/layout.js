import './globals.css';

export const metadata = {
  title: 'Incident Room',
  description: 'Real-time AI incident management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 font-sans antialiased">{children}</body>
    </html>
  );
}
