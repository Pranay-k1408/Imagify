import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
    const [state, setState] = useState('Login') // 'Login' or 'Sign Up'
    const { setShowLogin, backendUrl, setToken, setUser } = useContext(AppContext)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isLogin = state.toLowerCase() === 'login';
            const endpoint = isLogin ? '/api/user/login' : '/api/user/register';
            const payload = isLogin ? { email, password } : { name, email, password };

            const { data } = await axios.post(backendUrl + endpoint, payload);

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                setShowLogin(false);
                toast.success(isLogin ? `Welcome back, ${data.user.name}!` : 'Account created successfully!');
            } else {
                toast.error(data.message || 'Authentication failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Server error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [])

    return (
        <div className='fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex justify-center items-center p-4' onClick={() => setShowLogin(false)}>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear,
                input[type="password"]::-webkit-contacts-auto-fill-button,
                input[type="password"]::-webkit-credentials-auto-fill-button {
                    display: none !important;
                    visibility: hidden;
                    pointer-events: none;
                }
            `}</style>

            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className='relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-gray-100 p-8 sm:p-10 rounded-3xl shadow-2xl text-slate-600'
            >
                {/* Close Button */}
                <button
                    onClick={() => setShowLogin(false)}
                    className='absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all'
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Logo & Title */}
                <div className='text-center mb-6'>
                    <div className='inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-inner'>
                        <img src={assets.logo_icon} alt="Logo" className="w-7 h-7" />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>
                        {state === 'Login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className='text-xs text-gray-500 mt-1'>
                        {state === 'Login' ? 'Sign in to access your creative space' : 'Join Imagify and start generating images today'}
                    </p>
                </div>

                {/* Form Tabs */}
                <div className='flex p-1 bg-gray-100/80 rounded-xl mb-6'>
                    <button
                        type="button"
                        onClick={() => setState('Login')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            state === 'Login'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setState('Sign Up')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            state === 'Sign Up'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={onSubmitHandler} className='space-y-4'>
                    <AnimatePresence mode="wait">
                        {state !== 'Login' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className='relative flex items-center border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-4 py-3 bg-gray-50/50 transition-all'>
                                    <img className='w-4 h-4 opacity-50 mr-3' src={assets.profile_icon} alt="User" />
                                    <input
                                        onChange={e => setName(e.target.value)}
                                        value={name}
                                        type="text"
                                        className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                                        placeholder='Full Name'
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className='relative flex items-center border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-4 py-3 bg-gray-50/50 transition-all'>
                        <img className='w-4 h-4 opacity-50 mr-3' src={assets.email_icon} alt="Email" />
                        <input
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
                            placeholder='Email address'
                            required
                        />
                    </div>

                    <div className='relative flex items-center border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-4 py-3 bg-gray-50/50 transition-all'>
                        <img className='w-4 h-4 opacity-50 mr-3' src={assets.lock_icon} alt="Lock" />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            type={showPassword ? "text" : "password"}
                            className='w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden'
                            placeholder='Password'
                            autoComplete="new-password"
                            required
                            style={{ WebkitTextSecurity: showPassword ? 'none' : undefined }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-xs text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {state === 'Login' && (
                        <div className='flex justify-end text-xs'>
                            <span className='text-blue-600 hover:underline cursor-pointer font-medium'>
                                Forgot password?
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70'
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{state === 'Login' ? 'Signing in...' : 'Creating Account...'}</span>
                            </>
                        ) : (
                            <span>{state === 'Login' ? 'Sign In' : 'Create Account'}</span>
                        )}
                    </button>
                </form>

                {/* Footer Switch */}
                <div className='mt-6 text-center text-xs text-gray-500'>
                    {state === 'Login' ? (
                        <p>Don't have an account? <span className='text-blue-600 font-semibold cursor-pointer hover:underline' onClick={() => setState('Sign Up')}>Create one for free</span></p>
                    ) : (
                        <p>Already have an account? <span className='text-blue-600 font-semibold cursor-pointer hover:underline' onClick={() => setState('Login')}>Sign in to your account</span></p>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default Login