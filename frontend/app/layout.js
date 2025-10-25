import './globals.css';
import Providers from './providers.jsx';

export const metadata = {
  title: 'EHR Demo',
  description: 'Electronic Health Record System Demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
