'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, ArrowLeft, Loader2, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const router = useRouter();
    const { status } = useSession();

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
                setError('Invalid email or password');
                setLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div style={styles.page}>
                <Loader2 size={36} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Background Effects */}
            <div style={styles.bgImage}>
                <Image
                    src="/conan.jpg"
                    alt="Background"
                    fill
                    style={{ objectFit: 'cover', opacity: 0.08, filter: 'blur(2px)' }}
                    priority
                />
            </div>
            <div style={styles.bgOverlay} />
            <div style={styles.accent} />
            <div style={styles.accent2} />

            {/* Floating decorations */}
            <div style={styles.floatingIcon1}>🔍</div>
            <div style={styles.floatingIcon2}>⭐</div>
            <div style={styles.floatingIcon3}>🎯</div>

            {/* Main Content */}
            <div style={styles.container}>
                {/* Left Side - Branding */}
                <div style={styles.brandingSide}>
                    <div style={styles.brandingContent}>
                        <div style={styles.badge}>
                            <Sparkles size={14} />
                            <span>DCPH TALLY SYSTEM</span>
                        </div>
                        <h2 style={styles.brandingTitle}>
                            Welcome to<br />
                            <span style={styles.brandingHighlight}>Detective Conan PH</span>
                        </h2>
                        <p style={styles.brandingText}>
                            Track scores, manage events, and connect with the largest DC fan community in the Philippines.
                        </p>
                        <div style={styles.features}>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}>📊</div>
                                <span>Score Tracking</span>
                            </div>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}>🏆</div>
                                <span>Leaderboards</span>
                            </div>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}>📅</div>
                                <span>Event Calendar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={styles.formSide}>
                    <div style={styles.card}>
                        <div style={styles.header}>
                            <div style={styles.logo}>
                                <span style={styles.logoText}>D</span>
                            </div>
                            <h1 style={styles.title}>Sign In</h1>
                            <p style={styles.subtitle}>Access your Sensei Portal</p>
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div>
                                <label style={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    placeholder="sensei@dcph.com"
                                    required
                                    autoFocus
                                    style={{
                                        ...styles.input,
                                        ...(emailFocused ? styles.inputFocus : {}),
                                    }}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Password</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            ...styles.input,
                                            paddingRight: '50px',
                                            ...(passwordFocused ? styles.inputFocus : {}),
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.toggleBtn}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={styles.divider}>
                            <span style={styles.dividerLine} />
                            <span style={styles.dividerText}>Demo Account</span>
                            <span style={styles.dividerLine} />
                        </div>

                        <div style={styles.demoBox}>
                            <Shield size={16} style={{ color: '#3b82f6' }} />
                            <div style={styles.demoCredentials}>
                                <code style={styles.code}>carlo@dcph.com</code>
                                <span style={styles.separator}>•</span>
                                <code style={styles.code}>password123</code>
                            </div>
                        </div>

                        <Link href="/" style={styles.backLink}>
                            <ArrowLeft size={16} />
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    bgImage: {
        position: 'absolute',
        inset: 0,
        zIndex: 0,
    },
    bgOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.9) 100%)',
        zIndex: 1,
    },
    accent: {
        position: 'absolute',
        top: '-30%',
        right: '-15%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 2,
    },
    accent2: {
        position: 'absolute',
        bottom: '-30%',
        left: '-15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255, 149, 0, 0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 2,
    },
    floatingIcon1: {
        position: 'absolute',
        top: '15%',
        left: '8%',
        fontSize: '32px',
        opacity: 0.15,
        animation: 'float 6s ease-in-out infinite',
        zIndex: 3,
    },
    floatingIcon2: {
        position: 'absolute',
        top: '25%',
        right: '10%',
        fontSize: '28px',
        opacity: 0.12,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '-2s',
        zIndex: 3,
    },
    floatingIcon3: {
        position: 'absolute',
        bottom: '20%',
        left: '12%',
        fontSize: '24px',
        opacity: 0.1,
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '-4s',
        zIndex: 3,
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1000px',
        width: '100%',
        minHeight: '600px',
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
    },
    brandingSide: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.1) 100%)',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid rgba(255,255,255,0.05)',
    },
    brandingContent: {
        maxWidth: '350px',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '50px',
        padding: '8px 16px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#60a5fa',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '28px',
    },
    brandingTitle: {
        fontSize: '32px',
        fontWeight: 700,
        color: '#ffffff',
        lineHeight: 1.2,
        marginBottom: '20px',
        fontFamily: "'Crimson Text', serif",
    },
    brandingHighlight: {
        background: 'linear-gradient(135deg, #3b82f6, #f59e0b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    brandingText: {
        fontSize: '15px',
        color: '#888888',
        lineHeight: 1.7,
        marginBottom: '32px',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 16px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        fontSize: '14px',
        color: '#cccccc',
    },
    featureIcon: {
        fontSize: '18px',
    },
    formSide: {
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        maxWidth: '340px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logo: {
        width: '64px',
        height: '64px',
        margin: '0 auto 20px',
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.35)',
    },
    logoText: {
        color: 'white',
        fontSize: '28px',
        fontWeight: 700,
        fontFamily: "'Crimson Text', serif",
    },
    title: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: "'Crimson Text', serif",
        marginBottom: '6px',
    },
    subtitle: {
        color: '#666666',
        fontSize: '14px',
    },
    error: {
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '10px',
        color: '#f87171',
        fontSize: '13px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#888888',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        backgroundColor: '#0a0a0a',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#2a2a2a',
        borderRadius: '12px',
        fontSize: '15px',
        color: '#ffffff',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputFocus: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
    },
    passwordWrapper: {
        position: 'relative',
    },
    toggleBtn: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#555555',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        marginTop: '8px',
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '28px 0 20px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#2a2a2a',
    },
    dividerText: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#555555',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    demoBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '12px',
    },
    demoCredentials: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    code: {
        padding: '4px 10px',
        backgroundColor: 'rgba(255, 149, 0, 0.12)',
        color: '#f59e0b',
        borderRadius: '6px',
        fontFamily: "'Consolas', monospace",
        fontSize: '12px',
    },
    separator: {
        color: '#444444',
    },
    backLink: {
        marginTop: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: '#555555',
        textDecoration: 'none',
        fontSize: '13px',
    },
};
