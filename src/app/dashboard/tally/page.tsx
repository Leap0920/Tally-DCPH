'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Search, History, Send, Loader2, Award } from 'lucide-react';

export default function TallyPage() {
    const [studentName, setStudentName] = useState('');
    const [points, setPoints] = useState('');
    const [category, setCategory] = useState('GENERAL KNOWLEDGE');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    const categories = [
        'GENERAL KNOWLEDGE',
        'TOURISM',
        'OTHER ANIME',
        'OTHER GOSHO WORKS & DC TRIVIAS',
        'DC EPISODE 606-607',
        'BONUS POINTS'
    ];

    useEffect(() => { fetchRecords(); }, []);

    const fetchRecords = () => {
        fetch('/api/tally')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setRecords(data); setFetching(false); })
            .catch(() => setFetching(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName || !points) return;
        setLoading(true);
        try {
            const res = await fetch('/api/tally', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentName, points: parseInt(points), category, date: new Date() })
            });
            if (res.ok) { setStudentName(''); setPoints(''); fetchRecords(); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-10 pb-10 animate-fade-in-up">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <Award size={24} style={{ color: 'var(--accent-color)' }} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Tally System</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                    Score <span className="text-gradient">Recording</span>
                </h1>
                <p className="text-lg" style={{ color: 'var(--secondary-text)' }}>
                    Award points to students and track the scoring history.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6 sticky top-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                <PlusCircle size={24} style={{ color: 'var(--primary-color)' }} />
                            </div>
                            <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--text-color)' }}>New Score Entry</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Student Name</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--secondary-text)' }} />
                                <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="input-dark pl-12" placeholder="Enter student name..." required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Points</label>
                                <input type="number" value={points} onChange={e => setPoints(e.target.value)} className="input-dark text-center text-xl font-bold" placeholder="10" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--secondary-text)' }}>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="input-dark">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-blue-glow w-full py-4 text-lg mt-4">
                            {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><Send size={20} /> Submit Score</>}
                        </button>
                    </form>
                </div>

                {/* Records Table */}
                <div className="lg:col-span-2 card-elevated overflow-hidden">
                    <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h2 className="font-serif text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                            <History size={20} style={{ color: 'var(--primary-color)' }} /> Recent Records
                        </h2>
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--secondary-text)' }}>
                            {records.length} Total
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table-dark">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Category</th>
                                    <th>Sensei</th>
                                    <th>Date</th>
                                    <th className="text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetching ? (
                                    <tr><td colSpan={5} className="text-center py-16" style={{ color: 'var(--secondary-text)' }}>Loading records...</td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-16" style={{ color: 'var(--secondary-text)' }}>No records found. Add your first score!</td></tr>
                                ) : records.map((record) => (
                                    <tr key={record._id}>
                                        <td><span className="font-bold" style={{ color: 'var(--text-color)' }}>{record.studentName}</span></td>
                                        <td><span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{record.category}</span></td>
                                        <td style={{ color: 'var(--secondary-text)' }}>{record.awardedBy?.name || 'Unknown'}</td>
                                        <td className="text-sm" style={{ color: 'var(--secondary-text)' }}>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="text-right"><span className="font-serif text-xl font-bold" style={{ color: '#22c55e' }}>+{record.points}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
