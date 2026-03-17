import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentacles Orchestrator',
  description: 'Proactive Large Multimodal Agent Steering Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-gray-200">
        {children}
      </body>
    </html>
  );
}
