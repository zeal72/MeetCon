// components/QuickActions.jsx - Updated with proper user identity handling

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/Contexts/AuthContext';
import {
	Video,
	Calendar,
	Plus,
	Link,
	Phone,
	Sparkles,
	Zap,
	Shield
} from 'lucide-react';

export default function QuickActions({ onJoinMeeting }) {
	const { currentUser } = useAuth();

	const getUserIdentity = () => {
		if (!currentUser) return null;
		return currentUser.displayName || currentUser.email?.split('@')[0] || `User-${currentUser.uid.substring(0, 8)}`;
	};

	const handleStartMeeting = async () => {
		if (!currentUser) {
			toast.error('Please sign in to start a meeting');
			return;
		}

		const newMeetingId = Math.random().toString(36).substr(2, 9);
		const identity = getUserIdentity();
		
		try {
			console.log('Starting meeting with:', { identity, roomName: newMeetingId });
			
			// Show loading toast
			const loadingToast = toast.loading('Creating meeting...');
			
			const response = await fetch(`/api/token?identity=${encodeURIComponent(identity)}&roomName=${newMeetingId}`);
			
			console.log('Response status:', response.status);
			
			// Dismiss loading toast
			toast.dismiss(loadingToast);
			
			if (!response.ok) {
				if (response.headers.get('content-type')?.includes('text/html')) {
					console.error("Received HTML instead of JSON - API route may not exist");
					toast.error("API route not found. Please check if /pages/api/token.js exists.");
					return;
				}
				
				const errorText = await response.text();
				console.error('Error response:', errorText);
				
				// Try to parse as JSON for better error message
				try {
					const errorData = JSON.parse(errorText);
					toast.error(errorData.error || `HTTP error! status: ${response.status}`);
				} catch {
					toast.error(`HTTP error! status: ${response.status}`);
				}
				return;
			}

			const data = await response.json();
			console.log('Token response:', data);
			
			if (!data.token) {
				toast.error("No token received from server");
				console.error('No token in response:', data);
				return;
			}

			toast.success(`Meeting started! ID: ${newMeetingId}`);
			
			// Store the meeting data for the room component
			const meetingData = {
				token: data.token,
				identity: data.identity,
				roomName: data.roomName,
				livekitUrl: data.LIVEKIT_URL,
				userInfo: {
					displayName: currentUser.displayName,
					email: currentUser.email,
					photoURL: currentUser.photoURL,
					uid: currentUser.uid
				}
			};
			
			// Store in sessionStorage (more reliable than localStorage for this use case)
			sessionStorage.setItem('meetingData', JSON.stringify(meetingData));
			
			// Navigate to the room
			console.log('Navigating to:', `/room/${newMeetingId}`);
			window.location.href = `/room/${newMeetingId}`;
			
		} catch (error) {
			console.error("Failed to start meeting:", error);
			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				toast.error("Cannot connect to server. Please check if your server is running.");
			} else {
				toast.error(`Failed to start meeting: ${error.message}`);
			}
		}
	};

	const handleScheduleMeeting = () => {
		toast.success('Opening scheduler...');
		console.log('Schedule meeting functionality not yet implemented');
	};

	const actions = [
		{
			title: 'Start Meeting',
			description: 'Create an instant meeting and invite others',
			icon: Video,
			accent: Sparkles,
			gradient: 'from-green-500 to-emerald-600',
			hoverGradient: 'from-green-600 to-emerald-700',
			accentColor: 'text-green-400',
			action: handleStartMeeting,
			buttonText: 'Start Now',
			buttonIcon: Plus,
			requiresAuth: true
		},
		{
			title: 'Join Meeting',
			description: 'Join an existing meeting with an ID',
			icon: Link,
			accent: Zap,
			gradient: 'from-blue-500 to-cyan-600',
			hoverGradient: 'from-blue-600 to-cyan-700',
			accentColor: 'text-blue-400',
			action: onJoinMeeting,
			buttonText: 'Join',
			buttonIcon: Phone,
			requiresAuth: false
		},
		{
			title: 'Schedule Meeting',
			description: 'Plan and schedule meetings for later',
			icon: Calendar,
			accent: Shield,
			gradient: 'from-purple-500 to-pink-600',
			hoverGradient: 'from-purple-600 to-pink-700',
			accentColor: 'text-purple-400',
			action: handleScheduleMeeting,
			buttonText: 'Schedule',
			buttonIcon: Calendar,
			requiresAuth: true
		}
	];

	const handleActionClick = (action) => {
		if (action.requiresAuth && !currentUser) {
			toast.error('Please sign in to use this feature');
			return;
		}
		action.action();
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
			{actions.map((action, index) => (
				<motion.div
					key={action.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
					className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
				>
					<div className="flex items-center justify-between mb-4">
						<div className={`bg-gradient-to-r ${action.gradient} p-3 rounded-xl`}>
							<action.icon className="w-6 h-6 text-white" />
						</div>
						<action.accent className={`w-5 h-5 ${action.accentColor}`} />
					</div>
					<h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
					<p className="text-white/60 mb-4">{action.description}</p>
					
					{/* Show user info for authenticated actions */}
					{action.requiresAuth && currentUser && (
						<div className="mb-4 p-2 bg-white/5 rounded-lg">
							<div className="flex items-center space-x-2">
								{currentUser.photoURL ? (
									<img
										src={currentUser.photoURL}
										alt={currentUser.displayName || 'User'}
										className="w-6 h-6 rounded-full"
									/>
								) : (
									<div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
										<span className="text-white text-xs font-bold">
											{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
										</span>
									</div>
								)}
								<span className="text-white/80 text-sm">
									{getUserIdentity()}
								</span>
							</div>
						</div>
					)}

					<button
						onClick={() => handleActionClick(action)}
						className={`w-full bg-gradient-to-r ${action.gradient} cursor-pointer hover:${action.hoverGradient} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
							action.requiresAuth && !currentUser ? 'opacity-75' : ''
						}`}
					>
						<action.buttonIcon className="w-5 h-5" />
						<span>{action.buttonText}</span>
					</button>
				</motion.div>
			))}
		</div>
	);
}