import Sidebar from '@/components/layout/Sidebar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-color)' }}>
            <Sidebar />
            <main className="flex-1 ml-72 p-8 lg:p-10 overflow-y-auto min-h-screen" style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #0a0a0a 100%)' }}>
                {children}
            </main>
        </div>
    );
}
