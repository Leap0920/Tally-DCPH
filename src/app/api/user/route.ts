import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession() as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.profileImage) updateData.profileImage = data.profileImage;
        if (data.backgroundImage) updateData.backgroundImage = data.backgroundImage;

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const user = await User.findByIdAndUpdate(session.user.id, updateData, { new: true });

        return NextResponse.json({ message: 'Profile updated', user: { name: user.name, image: user.profileImage } });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession() as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        await User.findByIdAndDelete(session.user.id);

        return NextResponse.json({ message: 'Account deleted' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
