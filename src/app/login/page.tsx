'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { status } = useSession();

    // Redirect if already logged in
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
                setLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-color)' }}>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image src="/conan.jpg" alt="Background" fill className="object-cover opacity-20 blur-sm" priority />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,13,13,0.9) 0%, rgba(13,13,13,0.95) 100%)' }} />
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md mx-4 relative z-10 animate-fade-in-up">
                <div className="glass rounded-3xl p-10 shadow-2xl" style={{ border: '1px solid var(--border-color)' }}>

                    {/* Logo / Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl font-serif font-bold" style={{ background: 'linear-gradient(135deg, var(--primary-color), #1e40af)', color: 'white', boxShadow: 'var(--glow-primary)' }}>
                            D
                        </div>
                        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Sensei Portal</h1>
                        <p style={{ color: 'var(--secondary-text)' }}>Access the DCPH Tally System</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl text-center text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-dark"
                                placeholder="sensei@dcph.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-dark"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-blue-glow w-full py-4 text-lg mt-4"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Signing in...</>
                            ) : (
                                <><LogIn size={20} /> Sign In</>
                            )}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-10 text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--secondary-text)' }}>
                            <ArrowLeft size={16} /> Back to Homepage
                        </Link>
                    </div>
                </div>

                {/* Hint Text */}
                <p className="text-center mt-6 text-sm" style={{ color: 'var(--secondary-text)' }}>
                    Default credentials: <span className="text-white font-medium">carlo@dcph.com</span> / <span className="text-white font-medium">password123</span>
                </p>
            </div>
        </div>
    );
}
