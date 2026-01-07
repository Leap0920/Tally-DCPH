'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Globe, Save, Loader2, Sliders } from 'lucide-react';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);
    const [privacy, setPrivacy] = useState(false);
    const [publicAccess, setPublicAccess] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    const ToggleSwitch = ({ value, onChange }: { value: boolean, onChange: () => void }) => (
        <button onClick={onChange} className="w-14 h-8 rounded-full transition-all relative" style={{ background: value ? 'var(--primary-color)' : 'var(--border-color)' }}>
            <div className="absolute top-1 w-6 h-6 rounded-full transition-all" style={{ background: 'white', left: value ? '1.75rem' : '0.25rem' }} />
        </button>
    );

    const settings = [
        { icon: Bell, title: 'Push Notifications', desc: 'Receive alerts for new schedule topics or student score updates.', color: 'var(--primary-color)', bg: 'rgba(59, 130, 246, 0.1)', value: notifications, onChange: () => setNotifications(!notifications) },
        { icon: Shield, title: 'Privacy Mode', desc: 'Hide student codes in the public dashboard rankings.', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', value: privacy, onChange: () => setPrivacy(!privacy) },
        { icon: Globe, title: 'Public Access', desc: 'Allow visitors to view the weekly schedule without logging in.', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', value: publicAccess, onChange: () => setPublicAccess(!publicAccess) },
    ];

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up max-w-4xl">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <Sliders size={24} style={{ color: 'var(--accent-color)' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Configuration</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                    System <span className="text-gradient">Settings</span>
                </h1>
                <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                    Configure application-wide preferences.
                </p>
            </header>

            <div className="card-elevated divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {settings.map((setting, i) => (
                    <div key={i} className="p-8 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: setting.bg }}>
                                <setting.icon size={24} style={{ color: setting.color }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-color)' }}>{setting.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{setting.desc}</p>
                            </div>
                        </div>
                        <ToggleSwitch value={setting.value} onChange={setting.onChange} />
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} disabled={loading} className="btn-blue-glow px-10">
                    {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Save size={20} /> Save Preferences</>}
                </button>
            </div>
        </div>
    );
}
