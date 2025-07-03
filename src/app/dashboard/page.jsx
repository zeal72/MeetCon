'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
	Video,
	Calendar,
	Users,
	Plus,
	Link,
	Settings,
	Bell,
	Search,
	Clock,
	Camera,
	Mic,
	Monitor,
	Phone,
	Copy,
	User,
	LogOut,
	ChevronDown,
	Sparkles,
	Zap,
	Shield
} from 'lucide-react';

export default function VideoCallHomepage() {
	const [user, setUser] = useState({
		name: 'John Doe',
		email: 'john@example.com',
		avatar: null
	});
	const [currentTime, setCurrentTime] = useState(new Date());
	const [meetingId, setMeetingId] = useState('');
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [recentMeetings] = useState([
		{ id: '1', title: 'Team Standup', time: '10:00 AM', participants: 8, status: 'upcoming' },
		{ id: '2', title: 'Client Presentation', time: '2:00 PM', participants: 12, status: 'completed' },
		{ id: '3', title: 'Project Review', time: '4:30 PM', participants: 6, status: 'ongoing' }
	]);

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const handleStartMeeting = () => {
		const newMeetingId = Math.random().toString(36).substr(2, 9);
		toast.success(`Meeting started! Room ID: ${newMeetingId}`);
		// Navigate to meeting room
	};

	const handleJoinMeeting = () => {
		if (!meetingId.trim()) {
			toast.error('Please enter a meeting ID');
			return;
		}
		toast.success(`Joining meeting: ${meetingId}`);
		setIsJoinModalOpen(false);
		setMeetingId('');
		// Navigate to meeting room
	};

	const handleScheduleMeeting = () => {
		toast.success('Opening scheduler...');
		// Open scheduling modal
	};

	const copyMeetingLink = () => {
		navigator.clipboard.writeText('https://meet.example.com/abc-def-ghi');
		toast.success('Meeting link copied to clipboard!');
	};

	const formatTime = (date) => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	};

	const formatDate = (date) => {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

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

			{/* Header */}
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

						{/* Search */}
						<div className="flex-1 max-w-md mx-8">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
								<input
									type="text"
									placeholder="Search meetings, contacts..."
									className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50"
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center space-x-4">
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
											<div className="p-4 border-b border-white/20">
												<p className="text-white font-medium">{user.name}</p>
												<p className="text-white/60 text-sm">{user.email}</p>
											</div>
											<div className="p-2">
												<button className="w-full flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
													<LogOut className="w-4 h-4 mr-3" />
													Sign Out
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="text-center mb-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<h1 className="text-4xl font-bold text-white mb-4">
							Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}!
						</h1>
						<p className="text-white/60 text-lg mb-2">{formatDate(currentTime)}</p>
						<p className="text-white/80 text-2xl font-mono">{formatTime(currentTime)}</p>
					</motion.div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{/* Start Meeting */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
								<Video className="w-6 h-6 text-white" />
							</div>
							<Sparkles className="w-5 h-5 text-green-400" />
						</div>
						<h3 className="text-xl font-semibold text-white mb-2">Start Meeting</h3>
						<p className="text-white/60 mb-4">Create an instant meeting and invite others</p>
						<button
							onClick={handleStartMeeting}
							className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
						>
							<Plus className="w-5 h-5" />
							<span>Start Now</span>
						</button>
					</motion.div>

					{/* Join Meeting */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
								<Link className="w-6 h-6 text-white" />
							</div>
							<Zap className="w-5 h-5 text-blue-400" />
						</div>
						<h3 className="text-xl font-semibold text-white mb-2">Join Meeting</h3>
						<p className="text-white/60 mb-4">Join an existing meeting with an ID</p>
						<button
							onClick={() => setIsJoinModalOpen(true)}
							className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
						>
							<Phone className="w-5 h-5" />
							<span>Join</span>
						</button>
					</motion.div>

					{/* Schedule Meeting */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl">
								<Calendar className="w-6 h-6 text-white" />
							</div>
							<Shield className="w-5 h-5 text-purple-400" />
						</div>
						<h3 className="text-xl font-semibold text-white mb-2">Schedule Meeting</h3>
						<p className="text-white/60 mb-4">Plan and schedule meetings for later</p>
						<button
							onClick={handleScheduleMeeting}
							className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
						>
							<Calendar className="w-5 h-5" />
							<span>Schedule</span>
						</button>
					</motion.div>
				</div>

				{/* Recent Meetings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
				>
					<h2 className="text-2xl font-bold text-white mb-6 flex items-center">
						<Clock className="w-6 h-6 mr-3" />
						Recent Meetings
					</h2>
					<div className="space-y-4">
						{recentMeetings.map((meeting, index) => (
							<motion.div
								key={meeting.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.4, delay: index * 0.1 }}
								className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10"
							>
								<div className="flex items-center space-x-4">
									<div className={`w-3 h-3 rounded-full ${meeting.status === 'upcoming' ? 'bg-green-400' :
											meeting.status === 'ongoing' ? 'bg-blue-400' :
												'bg-gray-400'
										}`}></div>
									<div>
										<h3 className="text-white font-medium">{meeting.title}</h3>
										<p className="text-white/60 text-sm">{meeting.time} • {meeting.participants} participants</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
										{meeting.status === 'upcoming' ? 'Join' : meeting.status === 'ongoing' ? 'Rejoin' : 'View'}
									</button>
									<button onClick={copyMeetingLink} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
										<Copy className="w-4 h-4 text-white/60" />
									</button>
								</div>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Device Status */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
				>
					<h2 className="text-xl font-bold text-white mb-4">Device Status</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
							<Camera className="w-5 h-5 text-green-400" />
							<span className="text-white">Camera Ready</span>
						</div>
						<div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
							<Mic className="w-5 h-5 text-green-400" />
							<span className="text-white">Microphone Ready</span>
						</div>
						<div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
							<Monitor className="w-5 h-5 text-green-400" />
							<span className="text-white">Screen Share Ready</span>
						</div>
					</div>
				</motion.div>
			</main>

			{/* Join Meeting Modal */}
			<AnimatePresence>
				{isJoinModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
						onClick={() => setIsJoinModalOpen(false)}
					>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 w-full max-w-md mx-4"
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className="text-2xl font-bold text-white mb-4">Join Meeting</h3>
							<div className="space-y-4">
								<input
									type="text"
									placeholder="Enter meeting ID"
									value={meetingId}
									onChange={(e) => setMeetingId(e.target.value)}
									className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50"
								/>
								<div className="flex space-x-3">
									<button
										onClick={() => setIsJoinModalOpen(false)}
										className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleJoinMeeting}
										className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
									>
										Join
									</button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}