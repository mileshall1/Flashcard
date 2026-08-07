import './globals.css';

export const metadata = {
  title: 'Studii — Make exam prep stick',
  description: 'Turn class notes into focused flashcards, study smarter, and walk into your next exam ready.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
