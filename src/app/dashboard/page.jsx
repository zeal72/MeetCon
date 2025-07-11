'use client';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { auth, db } from '@/Lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref as dbRef, onValue } from 'firebase/database';

// Import components
import Header from '@/components/Header';
import WelcomeSection from '@/components/WelcomeSection';
import QuickActions from '@/components/QuickActions';
import RecentMeetings from '@/components/RecentMeetings';
import DeviceStatus from '@/components/DeviceStatus';
import JoinMeetingModal from '@/components/JoinMeetingModal';

export default function Dashboard() {
	const [user, setUser] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [meetingId, setMeetingId] = useState('');
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

	const [recentMeetings] = useState([
		{ id: '1', title: 'Team Standup', time: '10:00 AM', participants: 8, status: 'upcoming' },
		{ id: '2', title: 'Client Presentation', time: '2:00 PM', participants: 12, status: 'completed' },
		{ id: '3', title: 'Project Review', time: '4:30 PM', participants: 6, status: 'ongoing' }
	]);

	// ⏰ Live Clock
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	// 🔐 Get user from Firebase Realtime DB
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				const userRef = dbRef(db, `users/${firebaseUser.uid}`);
				onValue(userRef, (snapshot) => {
					const data = snapshot.val();
					if (data) {
						setUser({
							name: data.displayName || 'Unnamed',
							email: data.email || '',
							avatar: data.photoURL || null,
							uid: firebaseUser.uid
						});
					}
				});
			}
		});

		return () => unsubscribe();
	}, []);

	const handleOpenJoinModal = () => {
		setIsJoinModalOpen(true);
	};

	const handleCloseJoinModal = () => {
		setIsJoinModalOpen(false);
		setMeetingId('');
	};

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				Loading your dashboard...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: 'rgba(255, 255, 255, 0.95)',
						color: '#1f2937',
						backdropFilter: 'blur(10px)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
					},
				}}
			/>

			<Header uid={user.uid} />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<WelcomeSection user={user} currentTime={currentTime} />

				<QuickActions onJoinMeeting={handleOpenJoinModal} />

				<RecentMeetings meetings={recentMeetings} />

				<DeviceStatus />
			</main>

			<JoinMeetingModal
				isOpen={isJoinModalOpen}
				onClose={handleCloseJoinModal}
				meetingId={meetingId}
				setMeetingId={setMeetingId}
			/>
		</div>
	);
}
