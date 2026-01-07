import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const users = [
            { name: 'Carlo Baclao', email: 'carlo@dcph.com', role: 'sensei' },
            { name: 'Roldan Hilomen Parayno Jr.', email: 'roldan@dcph.com', role: 'sensei' },
            { name: 'Jacob Israel Bumacas', email: 'jacob@dcph.com', role: 'sensei' },
            { name: 'Ae Matsuda', email: 'ae@dcph.com', role: 'sensei' },
            { name: 'Hannah Joyce Romen', email: 'hannah@dcph.com', role: 'sensei' },
            { name: 'Admin User', email: 'admin@dcph.com', role: 'admin' },
        ];

        const password = await bcrypt.hash('password123', 10);

        const createdUsers = [];
        for (const u of users) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({ ...u, password });
                createdUsers.push(user.name);
            }
        }

        return NextResponse.json({ message: 'Seeding done', Created: createdUsers });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
