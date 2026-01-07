'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Crown, Flame } from 'lucide-react';

export default function StatsPage() {
    const [period, setPeriod] = useState('week');
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, [period]);

    const fetchStats = () => {
        setLoading(true);
        fetch(`/api/stats?period=${period}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setLeaderboard(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const periods = [
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' },
        { id: 'all', name: 'All Time' },
    ];

    const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const podiumIcons = [Crown, Medal, Award];

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up max-w-6xl mx-auto">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={24} style={{ color: 'var(--accent-color)' }} />
                        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Analytics</span>
                    </div>
                    <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                        Performance <span className="text-gradient">Stats</span>
                    </h1>
                    <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                        Student rankings and organization-wide analytics.
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex p-1.5 rounded-2xl gap-1" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    {periods.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                            style={period === p.id ? { background: 'linear-gradient(135deg, var(--primary-color), #1e40af)', color: 'white', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' } : { color: 'var(--secondary-text)' }}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-8">
                {[1, 0, 2].map((pos, gridIdx) => {
                    const PodiumIcon = podiumIcons[pos];
                    const data = leaderboard[pos];
                    const isFirst = pos === 0;

                    return (
                        <div
                            key={pos}
                            className={`podium-card ${pos === 0 ? 'podium-1 md:-translate-y-6' : pos === 1 ? 'podium-2' : 'podium-3'} ${gridIdx === 0 ? 'order-2 md:order-1' : gridIdx === 1 ? 'order-1 md:order-2' : 'order-3'}`}
                            style={isFirst ? { boxShadow: '0 0 60px rgba(255, 215, 0, 0.2)' } : {}}
                        >
                            {isFirst && (
                                <div className="absolute top-4 right-4">
                                    <Flame size={24} style={{ color: '#FFD700' }} />
                                </div>
                            )}
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: podiumColors[pos], boxShadow: `0 4px 30px ${podiumColors[pos]}40` }}>
                                <PodiumIcon size={36} style={{ color: pos === 0 ? '#000' : '#fff' }} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: podiumColors[pos] }}>
                                {pos === 0 ? 'Champion' : pos === 1 ? '2nd Place' : '3rd Place'}
                            </p>
                            <h3 className="font-serif text-2xl font-bold mb-4 truncate" style={{ color: 'var(--text-color)' }}>
                                {data?._id || '---'}
                            </h3>
                            <p className="font-serif font-bold" style={{ color: 'var(--primary-color)', fontSize: isFirst ? '3rem' : '2rem' }}>
                                {data?.totalPoints || 0}
                                <span className="text-sm font-sans ml-1" style={{ color: 'var(--secondary-text)' }}>pts</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Full Leaderboard */}
            <div className="card-elevated overflow-hidden">
                <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <Trophy size={20} style={{ color: 'var(--primary-color)' }} />
                    <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--text-color)' }}>Comprehensive Ranking</h2>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {loading ? (
                        <div className="p-20 text-center" style={{ color: 'var(--secondary-text)' }}>Updating leaderboard...</div>
                    ) : leaderboard.length <= 3 ? (
                        <div className="p-20 text-center" style={{ color: 'var(--secondary-text)' }}>No additional participants yet.</div>
                    ) : leaderboard.slice(3).map((item, idx) => (
                        <div key={item._id} className="p-6 flex items-center justify-between transition-colors" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div className="flex items-center gap-6">
                                <span className="w-8 text-lg font-bold" style={{ color: 'var(--secondary-text)' }}>#{idx + 4}</span>
                                <div>
                                    <p className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{item._id}</p>
                                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{item.activities} activities</p>
                                </div>
                            </div>
                            <p className="font-serif text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                                {item.totalPoints} <span className="text-sm font-sans" style={{ color: 'var(--secondary-text)' }}>pts</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
