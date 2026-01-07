'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
    Trophy,
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    Clock,
    Settings,
    Check,
    Sparkles,
    Award,
    Zap
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    studentName: string;
    category: string;
    points: number;
    time: string;
    initials: string;
}

interface ScheduleItem {
    id: string;
    topic: string;
    date: string;
    time: string;
    host: string;
    isToday: boolean;
}

interface Detective {
    rank: number;
    name: string;
    points: number;
    initials: string;
}

interface DashboardData {
    weeklyPoints: {
        value: number;
        change: number;
        target: number;
    };
    activeSensei: {
        count: number;
        users: Array<{ name: string; image?: string }>;
    };
    latestActivity: ActivityItem[];
    upcomingSchedule: ScheduleItem | null;
    topDetectives: Detective[];
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [serverOnline, setServerOnline] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard');
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
                setServerOnline(true);
            } else {
                setServerOnline(false);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setServerOnline(false);
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    // Default data for display
    const defaultData: DashboardData = {
        weeklyPoints: { value: 14250, change: 15, target: 20000 },
        activeSensei: { count: 12, users: [] },
        latestActivity: [
            { id: '1', studentName: 'Juan Dela Cruz', category: 'GENERAL KNOWLEDGE', points: 15, time: '2 min ago', initials: 'JD' },
            { id: '2', studentName: 'Maria Santos', category: 'OTHER ANIME', points: 10, time: '15 min ago', initials: 'MS' },
            { id: '3', studentName: 'Pedro Reyes', category: 'DC TRIVIA', points: 20, time: '1 hour ago', initials: 'PR' },
            { id: '4', studentName: 'Ana Gonzales', category: 'TOURISM', points: 10, time: '2 hours ago', initials: 'AG' },
            { id: '5', studentName: 'Rico Magsaysay', category: 'DC EPISODE', points: 15, time: '3 hours ago', initials: 'RM' },
        ],
        upcomingSchedule: {
            id: '1',
            topic: 'GEN-KNOWLEDGE TRIVIA',
            date: 'Today',
            time: '7:30 PM',
            host: 'Jacob Israel',
            isToday: true
        },
        topDetectives: [
            { rank: 1, name: 'Kaito Kuroba', points: 1250, initials: 'KK' },
            { rank: 2, name: 'Heiji Hattori', points: 1120, initials: 'HH' },
            { rank: 3, name: 'Kazuha Toyama', points: 980, initials: 'KT' },
        ]
    };

    const data = dashboardData || defaultData;
    const firstName = session?.user?.name?.split(' ')[0] || 'Carlo';

    return (
        <div className="dashboard-main animate-fade-in-up">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="version-badge">
                        <Settings size={14} />
                        <span>SENSEI DASHBOARD V2.0</span>
                    </div>
                    <h1 className="dashboard-greeting">
                        Hello, <span className="text-gradient">{firstName}</span>
                    </h1>
                    <p className="dashboard-subtitle">
                        Welcome back to the Command Center. Here's what's happening in the DCPH Community today.
                    </p>
                </div>
                <div className="dashboard-header-right">
                    <div className={`server-status ${serverOnline ? 'online' : 'offline'}`}>
                        <span className="server-label">SERVER:</span>
                        <span className="server-state">{serverOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        <span className={`server-indicator ${serverOnline ? 'pulse' : ''}`}></span>
                    </div>
                </div>
            </header>

            {/* Stats Cards Row */}
            <div className="stats-cards-row">
                {/* Weekly Points Card */}
                <div className="stat-card-v2 weekly-points">
                    <div className="stat-card-header">
                        <div className="stat-icon-badge">
                            <TrendingUp size={18} />
                        </div>
                        <span className="stat-label">WEEKLY POINTS</span>
                        <span className={`stat-change ${data.weeklyPoints.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.weeklyPoints.change >= 0 ? '+' : ''}{data.weeklyPoints.change}%
                        </span>
                    </div>
                    <div className="stat-value-large">
                        {formatNumber(data.weeklyPoints.value)}
                    </div>
                    <div className="stat-target">
                        Target: {formatNumber(data.weeklyPoints.target)} pts
                    </div>
                </div>

                {/* Active Sensei Card */}
                <div className="stat-card-v2 active-sensei">
                    <div className="stat-card-header">
                        <div className="stat-icon-badge purple">
                            <Users size={18} />
                        </div>
                        <span className="stat-label">ACTIVE SENSEI</span>
                        <span className="stat-badge online">ONLINE</span>
                    </div>
                    <div className="stat-value-large">
                        {data.activeSensei.count}
                    </div>
                    <div className="avatar-stack">
                        {[...Array(Math.min(3, data.activeSensei.count))].map((_, i) => (
                            <div key={i} className="avatar-circle" style={{ zIndex: 3 - i }}>
                                <Users size={14} />
                            </div>
                        ))}
                        {data.activeSensei.count > 3 && (
                            <div className="avatar-circle more">
                                +{data.activeSensei.count - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content-grid">
                {/* Latest Activity Section */}
                <div className="activity-section">
                    <div className="section-header">
                        <div className="section-title-group">
                            <Zap size={20} className="section-icon" />
                            <h2>Latest Activity</h2>
                        </div>
                        <Link href="/dashboard/tally" className="launch-btn">
                            LAUNCH TALLY SYSTEM
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="activity-list">
                        {data.latestActivity.map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-avatar">
                                    {item.initials}
                                </div>
                                <div className="activity-details">
                                    <h4>{item.studentName}</h4>
                                    <p>
                                        <span className="category-tag">{item.category}</span>
                                        <span className="separator">•</span>
                                        <Clock size={12} />
                                        <span>{item.time}</span>
                                    </p>
                                </div>
                                <div className="activity-points">
                                    <span className="points-value">+{item.points}</span>
                                    <span className="points-label">POINTS</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="sidebar-widgets">
                    {/* Tally System Widget */}
                    <div className="widget-card tally-system">
                        <div className="widget-header">
                            <div className="widget-icon purple">
                                <Award size={20} />
                            </div>
                            <h3>Tally System</h3>
                            <Settings size={18} className="widget-settings" />
                        </div>
                        <div className="widget-content">
                            <span className="ready-label">READY TO USE</span>
                            <h4 className="widget-title">QUIZ SCORING SYSTEM</h4>
                            <ul className="feature-list">
                                <li>
                                    <Check size={16} className="check-icon" />
                                    Real-time participant management
                                </li>
                                <li>
                                    <Check size={16} className="check-icon" />
                                    Automated scoring & leaderboards
                                </li>
                                <li>
                                    <Check size={16} className="check-icon" />
                                    Configurable scoring modes
                                </li>
                            </ul>
                            <Link href="/dashboard/tally" className="widget-action-btn">
                                <Sparkles size={16} />
                                LAUNCH TALLY SYSTEM
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Widget */}
                    <div className="widget-card upcoming">
                        <div className="widget-header">
                            <div className="widget-icon blue">
                                <Calendar size={20} />
                            </div>
                            <h3>Upcoming</h3>
                            <Sparkles size={18} className="widget-sparkle" />
                        </div>
                        <div className="widget-content">
                            <span className="session-label">LIVE SESSION</span>
                            <h4 className="event-title">
                                {data.upcomingSchedule?.topic || 'GEN-KNOWLEDGE TRIVIA'}
                            </h4>
                            <div className="event-details">
                                <p>
                                    <Clock size={14} />
                                    <span>{data.upcomingSchedule?.isToday ? 'Today' : data.upcomingSchedule?.date}, {data.upcomingSchedule?.time || '7:30 PM'}</span>
                                </p>
                                <p>
                                    <Users size={14} />
                                    <span>Host: {data.upcomingSchedule?.host || 'Jacob Israel'}</span>
                                </p>
                            </div>
                            <Link href="/dashboard/calendar" className="manage-event-btn">
                                MANAGE EVENT
                            </Link>
                        </div>
                    </div>

                    {/* Top Detectives Widget */}
                    <div className="widget-card top-detectives">
                        <div className="widget-header">
                            <div className="widget-icon gold">
                                <Trophy size={20} />
                            </div>
                            <h3>Top Detectives</h3>
                        </div>
                        <div className="widget-content leaderboard">
                            {data.topDetectives.slice(0, 3).map((detective) => (
                                <div key={detective.rank} className="leaderboard-item">
                                    <span className={`rank rank-${detective.rank}`}>{detective.rank}</span>
                                    <div className="detective-avatar">
                                        {detective.initials}
                                    </div>
                                    <div className="detective-info">
                                        <span className="detective-name">{detective.name}</span>
                                    </div>
                                    <span className="detective-points">{formatNumber(detective.points)} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
