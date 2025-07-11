'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Video,
	Bell,
	Search,
	Settings,
	User,
	LogOut,
	ChevronDown,
	Menu
} from 'lucide-react';
import { onValue, ref as dbRef } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/Lib/firebase';
import { useRouter } from 'next/navigation';

export default function Header({ uid }) {
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [userData, setUserData] = useState({
		name: 'Loading...',
		email: 'Loading...'
	});
	const router = useRouter();

	useEffect(() => {
		if (!uid) return;

		const userRef = dbRef(db, `users/${uid}`);
		const unsubscribe = onValue(userRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				setUserData({
					name: data.displayName || 'No Name',
					email: data.email || 'No Email'
				});
			}
		});

		return () => unsubscribe();
	}, [uid]);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center">
						<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
							<Video className="w-6 h-6 text-white" />
						</div>
						<span className="ml-3 text-xl font-bold text-white">MeetSpace</span>
					</div>

					{/* Desktop Search */}
					<div className="hidden md:flex flex-1 max-w-md mx-8">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
							<input
								type="text"
								placeholder="Search meetings, contacts..."
								className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50"
							/>
						</div>
					</div>

					{/* Desktop Actions */}
					<div className="hidden md:flex items-center space-x-4">
						<button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
							<Bell className="w-5 h-5 text-white" />
						</button>
						<button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
							<Settings className="w-5 h-5 text-white" />
						</button>

						{/* User Menu */}
						<div className="relative">
							<button
								onClick={() => setShowUserMenu(!showUserMenu)}
								className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
							>
								<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
									<User className="w-5 h-5 text-white" />
								</div>
								<ChevronDown className="w-4 h-4 text-white" />
							</button>

							<AnimatePresence>
								{showUserMenu && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 z-50"
									>
										<div className="p-4 border-b border-white/20 space-y-1">
											<p className="text-white font-medium text-sm truncate max-w-[11rem]">
												{userData.name}
											</p>
											<p className="text-white/60 text-xs truncate max-w-[11rem]">
												{userData.email}
											</p>
										</div>

										<div className="p-2">
											<button
												onClick={handleLogout}
												className="w-full flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
											>
												<LogOut className="w-4 h-4 mr-3" />
												Sign Out
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Mobile Hamburger */}
					<div className="md:hidden">
						<button
							className="p-2 rounded-lg hover:bg-white/10 transition-colors"
							onClick={() => setShowMobileMenu(true)}
						>
							<Menu className="w-6 h-6 text-white" />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Drawer */}
			<AnimatePresence>
				{showMobileMenu && (
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed inset-0 z-50 backdrop-blur-sm md:hidden"
					>
						<div className="absolute right-0 top-0 h-full w-64 bg-gray-500 backdrop-blur-lg border-l p-6 space-y-6">
							<div className="flex items-center bg-gray-500 justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
										<User className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-white font-medium text-sm truncate max-w-[10rem]">
											{userData.name}
										</p>
										<p className="text-white/60 text-xs truncate max-w-[10rem]">
											{userData.email}
										</p>
									</div>
								</div>
								<button onClick={() => setShowMobileMenu(false)}>
									<ChevronDown className="text-white rotate-180" />
								</button>
							</div>

							<div className="space-y-4">
								<button className="w-full flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg">
									<Search className="w-5 h-5" />
									Search
								</button>
								<button className="w-full flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg">
									<Bell className="w-5 h-5" />
									Notifications
								</button>
								<button className="w-full flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg">
									<Settings className="w-5 h-5" />
									Settings
								</button>
								<button
									onClick={handleLogout}
									className="w-full flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg"
								>
									<LogOut className="w-5 h-5" />
									Sign Out
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
