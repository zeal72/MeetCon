import { motion } from 'framer-motion';

export default function WelcomeSection({ user, currentTime }) {
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

	const getGreeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return 'Morning';
		if (hour < 18) return 'Afternoon';
		return 'Evening';
	};

	return (
		<div className="text-center mb-12">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h1 className="text-4xl font-bold text-white mb-4">
					Good {getGreeting()}, {user.name.split(' ')[0]}!
				</h1>
				<p className="text-white/60 text-lg mb-2">{formatDate(currentTime)}</p>
				<p className="text-white/80 text-2xl font-mono">{formatTime(currentTime)}</p>
			</motion.div>
		</div>
	);
}