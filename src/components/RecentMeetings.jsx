import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clock, Copy } from 'lucide-react';

export default function RecentMeetings({ meetings }) {
	const copyMeetingLink = () => {
		navigator.clipboard.writeText('https://meet.example.com/abc-def-ghi');
		toast.success('Meeting link copied to clipboard!');
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'upcoming':
				return 'bg-green-400';
			case 'ongoing':
				return 'bg-blue-400';
			case 'completed':
				return 'bg-gray-400';
			default:
				return 'bg-gray-400';
		}
	};

	const getActionText = (status) => {
		switch (status) {
			case 'upcoming':
				return 'Join';
			case 'ongoing':
				return 'Rejoin';
			case 'completed':
				return 'View';
			default:
				return 'View';
		}
	};

	return (
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
				{meetings.map((meeting, index) => (
					<motion.div
						key={meeting.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: index * 0.1 }}
						className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10"
					>
						<div className="flex items-center space-x-4">
							<div className={`w-3 h-3 rounded-full ${getStatusColor(meeting.status)}`}></div>
							<div>
								<h3 className="text-white font-medium">{meeting.title}</h3>
								<p className="text-white/60 text-sm">{meeting.time} • {meeting.participants} participants</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
								{getActionText(meeting.status)}
							</button>
							<button onClick={copyMeetingLink} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
								<Copy className="w-4 h-4 text-white/60" />
							</button>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}