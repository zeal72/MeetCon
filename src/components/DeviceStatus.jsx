import { motion } from 'framer-motion';
import { Camera, Mic, Monitor } from 'lucide-react';

export default function DeviceStatus() {
	const devices = [
		{
			name: 'Camera Ready',
			icon: Camera,
			status: 'ready'
		},
		{
			name: 'Microphone Ready',
			icon: Mic,
			status: 'ready'
		},
		{
			name: 'Screen Share Ready',
			icon: Monitor,
			status: 'ready'
		}
	];

	const getStatusColor = (status) => {
		switch (status) {
			case 'ready':
				return 'text-green-400';
			case 'error':
				return 'text-red-400';
			case 'warning':
				return 'text-yellow-400';
			default:
				return 'text-gray-400';
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.5 }}
			className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
		>
			<h2 className="text-xl font-bold text-white mb-4">Device Status</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{devices.map((device, index) => (
					<motion.div
						key={device.name}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
						className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
					>
						<device.icon className={`w-5 h-5 ${getStatusColor(device.status)}`} />
						<span className="text-white">{device.name}</span>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}