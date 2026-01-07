'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, BookOpen, User, CheckCircle2, Circle, PlusCircle, Loader2 } from 'lucide-react';

interface ISchedule {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    assignedTo: { name: string; profileImage?: string };
    postingStatus: 'pending' | 'done';
    logStatus: 'pending' | 'done';
}

export default function CalendarPage() {
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/schedule')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setSchedules(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayColors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444'];

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon size={24} style={{ color: 'var(--accent-color)' }} />
                        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Schedule</span>
                    </div>
                    <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                        Weekly <span className="text-gradient">Calendar</span>
                    </h1>
                    <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                        View and manage the upcoming topics for the week.
                    </p>
                </div>

                <button className="btn-blue-glow">
                    <PlusCircle size={20} /> Add Schedule
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {days.map((day, idx) => {
                        const daySchedules = schedules.filter(s => {
                            const d = new Date(s.date);
                            return d.toLocaleDateString('en-US', { weekday: 'long' }) === day;
                        });

                        return (
                            <div key={day} className="space-y-4">
                                {/* Day Header */}
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: dayColors[idx] }} />
                                    <h2 className="font-serif text-lg font-bold" style={{ color: 'var(--text-color)' }}>{day}</h2>
                                </div>

                                {/* Schedule Cards */}
                                <div className="space-y-4">
                                    {daySchedules.length > 0 ? daySchedules.map((sched) => (
                                        <div key={sched._id} className="card-elevated p-5 group" style={{ borderTop: `3px solid ${dayColors[idx]}` }}>
                                            {/* Time */}
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: dayColors[idx] }}>
                                                <Clock size={14} /> {sched.startTime} - {sched.endTime}
                                            </div>

                                            {/* Topic */}
                                            <h3 className="font-bold text-base mb-4 leading-snug group-hover:text-[var(--primary-color)] transition-colors" style={{ color: 'var(--text-color)' }}>
                                                {sched.topic}
                                            </h3>

                                            {/* Sensei */}
                                            <div className="flex items-center gap-2 p-2 rounded-lg mb-4" style={{ background: 'var(--bg-elevated)' }}>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                                    <User size={14} style={{ color: 'var(--primary-color)' }} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>Sensei</p>
                                                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-color)' }}>{sched.assignedTo?.name || 'Unassigned'}</p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--secondary-text)' }}>
                                                    {sched.postingStatus === 'done' ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <Circle size={14} />}
                                                    POST
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--secondary-text)' }}>
                                                    {sched.logStatus === 'done' ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <Circle size={14} />}
                                                    LOG
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="card-elevated p-8 flex flex-col items-center justify-center text-center" style={{ borderStyle: 'dashed', background: 'transparent' }}>
                                            <BookOpen size={32} style={{ color: 'var(--border-color)' }} className="mb-2" />
                                            <p className="text-sm italic" style={{ color: 'var(--secondary-text)' }}>No schedule</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
