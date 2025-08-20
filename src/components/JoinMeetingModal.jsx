// components/JoinMeetingModal.js - Updated version

import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function JoinMeetingModal({ isOpen, onClose, meetingId, setMeetingId }) {
	const handleJoinMeeting = async () => {
		if (!meetingId.trim()) {
			toast.error('Please enter a meeting ID');
			return;
		}

		toast.success(`Joining meeting: ${meetingId}`);
		onClose();
		setMeetingId('');
		
		// Navigate to the room without token - let the room component handle authentication
		window.location.href = `/room/${meetingId}`;
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleJoinMeeting();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
					onClick={onClose}
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
								onKeyPress={handleKeyPress}
								className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50"
								autoFocus
							/>
							<div className="flex space-x-3">
								<button
									onClick={onClose}
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
	);
}