'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { auth, googleProvider, db } from '@/Lib/firebase';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	onAuthStateChanged,
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) router.push('/dashboard');
		});
		return () => unsub();
	}, [router]);

	const saveUserToDatabase = async (user, displayName = null) => {
		try {
			const userRef = ref(db, `users/${user.uid}`);
			const snapshot = await get(userRef);

			if (!snapshot.exists()) {
				await set(userRef, {
					uid: user.uid,
					email: user.email,
					displayName: displayName || user.displayName || name,
					photoURL: user.photoURL || null,
					createdAt: new Date().toISOString(),
					lastLogin: new Date().toISOString(),
				});
			} else {
				// Update last login
				await set(child(userRef, 'lastLogin'), new Date().toISOString());
			}
		} catch (error) {
			console.error('Error saving user to database:', error);
			toast.error('Failed to save user data');
		}
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			let userCredential;

			if (isSignUp) {
				if (!name.trim()) {
					toast.error('Please enter your name');
					setIsLoading(false);
					return;
				}
				userCredential = await createUserWithEmailAndPassword(auth, email, password);
				await saveUserToDatabase(userCredential.user, name);
				toast.success('Account created successfully! Welcome aboard! 🎉');
			} else {
				userCredential = await signInWithEmailAndPassword(auth, email, password);
				await saveUserToDatabase(userCredential.user);
				toast.success('Welcome back! 👋');
			}

			router.push('/dashboard');
		} catch (err) {
			console.error('Auth error:', err);
			switch (err.code) {
				case 'auth/email-already-in-use':
					toast.error('Email already in use. Try signing in instead.');
					break;
				case 'auth/weak-password':
					toast.error('Password should be at least 6 characters.');
					break;
				case 'auth/user-not-found':
					toast.error('No account found with this email.');
					break;
				case 'auth/wrong-password':
					toast.error('Incorrect password. Please try again.');
					break;
				case 'auth/invalid-email':
					toast.error('Invalid email address.');
					break;
				default:
					toast.error('Something went wrong. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			await saveUserToDatabase(result.user);
			toast.success('Signed in with Google successfully! 🚀');
			router.push('/dashboard');
		} catch (err) {
			console.error('Google sign in error:', err);
			toast.error('Google sign in failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleMode = () => {
		setIsSignUp(!isSignUp);
		setEmail('');
		setPassword('');
		setName('');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
			<Toaster
				position="top-center"
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

			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative"
			>
				<div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full md:w-[100%] max-w-md border border-white/20">
					{/* Toggle Switch */}
					<div className="flex justify-center mb-8">
						<div className="bg-white/20 p-1 rounded-full flex relative">
							<motion.div
								className="absolute top-1 bottom-1 bg-white rounded-full shadow-lg"
								animate={{
									left: isSignUp ? '50%' : '4px',
									right: isSignUp ? '4px' : '50%',
								}}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
							/>
							<button
								onClick={toggleMode}
								className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative z-10 ${!isSignUp ? 'text-gray-800' : 'text-white/80 hover:text-white'
									}`}
							>
								Sign In
							</button>
							<button
								onClick={toggleMode}
								className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative z-10 ${isSignUp ? 'text-gray-800' : 'text-white/80 hover:text-white'
									}`}
							>
								Sign Up
							</button>
						</div>
					</div>

					<motion.div
						key={isSignUp ? 'signup' : 'signin'}
						initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
					>
						<h1 className="text-3xl font-bold mb-2 text-center text-white">
							{isSignUp ? 'Create Account' : 'Welcome Back'}
						</h1>
						<p className="text-white/60 text-center mb-8">
							{isSignUp
								? 'Join us and start your journey today'
								: 'Sign in to continue to your account'
							}
						</p>

						<form onSubmit={handleFormSubmit} className="space-y-6">
							<AnimatePresence>
								{isSignUp && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
									>
										<div className="relative">
											<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
											<input
												type="text"
												placeholder="Full Name"
												className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required={isSignUp}
											/>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
								<input
									type="email"
									placeholder="Email Address"
									className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Password"
									className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
								>
									{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>

							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										<span className="ml-2">
											{isSignUp ? 'Creating Account...' : 'Signing In...'}
										</span>
									</div>
								) : (
									isSignUp ? 'Create Account' : 'Sign In'
								)}
							</motion.button>
						</form>

						<div className="my-6 flex items-center">
							<div className="flex-1 h-px bg-white/20"></div>
							<span className="px-4 text-white/60 text-sm">or</span>
							<div className="flex-1 h-px bg-white/20"></div>
						</div>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={handleGoogleSignIn}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-4 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<img
								src="https://www.svgrepo.com/show/475656/google-color.svg"
								alt="Google"
								className="w-5 h-5"
							/>
							Continue with Google
						</motion.button>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}