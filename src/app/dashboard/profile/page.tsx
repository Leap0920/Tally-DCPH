'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Camera, Lock, Trash2, Save, Loader2, ImageIcon, Shield } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(session?.user?.image || '');
    const [bgImage, setBgImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password, profileImage, backgroundImage: bgImage })
            });

            if (res.ok) {
                setMessage('Profile updated successfully!');
                setMessageType('success');
                await update({ user: { ...session?.user, name, image: profileImage } });
            } else {
                setMessage('Failed to update profile.');
                setMessageType('error');
            }
        } catch (err) {
            setMessage('An error occurred.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your account? This action is permanent.')) return;
        try {
            const res = await fetch('/api/user', { method: 'DELETE' });
            if (res.ok) signOut({ callbackUrl: '/' });
        } catch (err) { alert('Failed to delete account.'); }
    };

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up max-w-4xl">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <Shield size={24} style={{ color: 'var(--accent-color)' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Account</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                    Profile <span className="text-gradient">Settings</span>
                </h1>
                <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                    Manage your account information and preferences.
                </p>
            </header>

            <div className="card-elevated overflow-hidden">
                {/* Background Preview */}
                <div className="h-40 relative group" style={{ background: 'var(--bg-elevated)' }}>
                    {bgImage ? (
                        <Image src={bgImage} alt="Background" fill className="object-cover opacity-50" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={48} style={{ color: 'var(--border-color)' }} />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                            <Camera size={16} /> Background Preview
                        </span>
                    </div>
                </div>

                <div className="p-8 pt-0 relative">
                    {/* Profile Image */}
                    <div className="relative -mt-16 mb-8 inline-block group">
                        <div className="w-32 h-32 rounded-full overflow-hidden relative" style={{ background: 'var(--card-bg)', border: '4px solid var(--card-bg)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            {profileImage ? (
                                <Image src={profileImage} alt="Profile" fill className="object-cover" />
                            ) : (
                                <User className="absolute inset-0 m-auto" size={48} style={{ color: 'var(--secondary-text)' }} />
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <Camera size={24} style={{ color: 'white' }} />
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className="mb-8 p-4 rounded-xl font-medium" style={{
                            background: messageType === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${messageType === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            color: messageType === 'success' ? '#22c55e' : '#ef4444'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="font-serif text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                <User size={18} style={{ color: 'var(--primary-color)' }} /> Basic Info
                            </h3>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Profile Image URL</label>
                                <input type="text" value={profileImage} onChange={e => setProfileImage(e.target.value)} className="input-dark" placeholder="https://example.com/image.jpg" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Background Image URL</label>
                                <input type="text" value={bgImage} onChange={e => setBgImage(e.target.value)} className="input-dark" placeholder="https://example.com/bg.jpg" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-serif text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                <Lock size={18} style={{ color: 'var(--primary-color)' }} /> Security
                            </h3>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-dark" placeholder="Leave blank to keep current" />
                            </div>
                            <div className="pt-6">
                                <button type="submit" disabled={loading} className="btn-blue-glow w-full py-4">
                                    {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Save size={20} /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card-elevated p-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2" style={{ color: '#ef4444' }}>
                        <Trash2 size={20} /> Danger Zone
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                </div>
                <button onClick={handleDelete} className="px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2" style={{ background: '#ef4444', color: 'white' }}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}
