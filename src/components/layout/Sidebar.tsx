'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    BarChart3,
    Calendar,
    Settings,
    User,
    LogOut,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tally', href: '/dashboard/tally', icon: PlusCircle },
    { name: 'Stats', href: '/dashboard/stats', icon: BarChart3 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    return (
        <aside className="sidebar-container">
            {/* Logo Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">D</div>
                <div>
                    <span className="sidebar-title">DCPH Tally</span>
                    <span className="sidebar-subtitle">COMMAND CENTER</span>
                </div>
            </div>

            {/* Navigation Label */}
            <div className="sidebar-nav-label">NAVIGATION MENU</div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span className="flex-1">{item.name}</span>
                            {isActive && <ChevronRight size={16} />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Card */}
            <div className="sidebar-footer">
                <div className="sidebar-user-card">
                    <div className="sidebar-avatar">
                        {session?.user?.image ? (
                            <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{session?.user?.name || 'Sensei'}</p>
                        <p className="sidebar-user-role">
                            <Sparkles size={12} />
                            {(session?.user as any)?.role || 'Sensei'}
                        </p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="sidebar-logout"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
