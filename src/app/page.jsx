import HomeClient from './HomeClient';

// Dynamic metadata generation - only works in Server Components
export const metadata = {
  title: 'MeetSpace - Connect, Collaborate, Create',
  description: 'Experience seamless video conferencing with crystal-clear quality and intuitive controls.',
  keywords: ['video call', 'meeting', 'conference', 'collaboration'],
  openGraph: {
    title: 'MeetSpace - Connect, Collaborate, Create',
    description: 'Experience seamless video conferencing with crystal-clear quality and intuitive controls.',
    type: 'website',
    siteName: 'MeetSpace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetSpace - Connect, Collaborate, Create',
    description: 'Experience seamless video conferencing with crystal-clear quality and intuitive controls.',
  },
};

// Server Component that renders the Client Component
export default function Home({ searchParams }) {
  return <HomeClient searchParams={searchParams} />;
}
