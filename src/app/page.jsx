import HomeClient from './HomeClient';

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

// Server Component
export default function Home() {
  return <HomeClient />;
}