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
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main-wrapper">
                {children}
            </main>
        </div>
    );
}
