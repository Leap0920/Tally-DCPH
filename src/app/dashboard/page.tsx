'use client';

import { useSession } from 'next-auth/react';
import {
    Users,
    Calendar as CalendarIcon,
    Trophy,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Clock,
    Zap
} from 'lucide-react';

export default function DashboardPage() {
    const { data: session } = useSession();

    const stats = [
        { label: 'Total Students', value: '1,284', icon: Users, color: '#3b82f6', change: '+12%' },
        { label: 'Weekly Points', value: '14,250', icon: TrendingUp, color: '#22c55e', change: '+28%' },
        { label: 'Upcoming Topics', value: '3', icon: CalendarIcon, color: '#f97316', change: 'This Week' },
        { label: 'Active Sensie', value: '12', icon: Activity, color: '#a855f7', change: 'Online' },
    ];

    const recentActivity = [
        { name: 'Juan Dela Cruz', subject: 'General Knowledge', points: 15, time: '2 min ago' },
        { name: 'Maria Santos', subject: 'Other Anime', points: 10, time: '15 min ago' },
        { name: 'Pedro Reyes', subject: 'DC Trivia', points: 20, time: '1 hour ago' },
        { name: 'Ana Gonzales', subject: 'Tourism', points: 10, time: '2 hours ago' },
        { name: 'Rico Magsaysay', subject: 'DC Episode', points: 15, time: '3 hours ago' },
    ];

    const leaderboard = [
        { name: 'Kaito Kuroba', points: 1250, avatar: '🎩' },
        { name: 'Heiji Hattori', points: 1120, avatar: '🔍' },
        { name: 'Kazuha Toyama', points: 980, avatar: '🌸' },
    ];

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up">
            {/* Header */}
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={24} style={{ color: 'var(--accent-color)' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Dashboard</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                    Welcome back, <span className="text-gradient">{session?.user?.name?.split(' ')[0] || 'Sensei'}</span>
                </h1>
                <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                    Here's what's happening with the DCPH Tally this week.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 rounded-xl" style={{ background: `${stat.color}20` }}>
                                <stat.icon size={24} style={{ color: stat.color }} />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${stat.color}15`, color: stat.color }}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>{stat.label}</p>
                        <h3 className="font-serif text-4xl font-bold" style={{ color: 'var(--text-color)' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Activity - 2 columns */}
                <div className="lg:col-span-2 card-elevated p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Recent Tally Activity</h2>
                        <a href="/dashboard/tally" className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: 'var(--primary-color)' }}>
                            View All <ArrowUpRight size={16} />
                        </a>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl transition-colors" style={{ background: 'var(--bg-elevated)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #1e40af)', color: 'white' }}>
                                        {item.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: 'var(--text-color)' }}>{item.name}</p>
                                        <p className="text-sm flex items-center gap-2" style={{ color: 'var(--secondary-text)' }}>
                                            <Clock size={12} /> {item.time} • {item.subject}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-serif text-xl font-bold" style={{ color: '#22c55e' }}>+{item.points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-8">

                    {/* Next Schedule Card */}
                    <div className="card-elevated p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)' }}>
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <CalendarIcon size={140} />
                        </div>
                        <h2 className="font-serif text-xl font-bold mb-6 relative z-10" style={{ color: 'var(--text-color)' }}>
                            Next Schedule
                        </h2>
                        <div className="relative z-10 p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-color)' }}>TODAY</p>
                            <p className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>GENERAL KNOWLEDGE</p>
                            <p className="text-sm mb-3" style={{ color: 'var(--secondary-text)' }}>7:30pm - 8:30pm</p>
                            <p className="text-sm italic" style={{ color: 'var(--secondary-text)' }}>by Jacob Israel Bumacas</p>
                        </div>
                    </div>

                    {/* Leaderboard Card */}
                    <div className="card-elevated p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                <Trophy size={20} style={{ color: '#FFD700' }} /> Top Scorers
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {leaderboard.map((user, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                    <span className="font-bold text-lg w-6" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>
                                        {i + 1}
                                    </span>
                                    <span className="text-2xl">{user.avatar}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate" style={{ color: 'var(--text-color)' }}>{user.name}</p>
                                    </div>
                                    <span className="font-bold" style={{ color: 'var(--primary-color)' }}>{user.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
