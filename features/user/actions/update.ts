'use server';

import { prisma } from "@/lib/prisma";
import { userFormValues } from "../validations";
import { Role, StatusUser } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hash } from "@/lib/bcrypt";

export async function update(id: number, formData: userFormValues) {
    const find = await prisma.user.findUnique({ where: { id } });
    if (!find) return { error: 'User tidak ditemukan' };

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        throw new Error('User not authenticated');
    }
    const updateData = {
        name: formData.name,
        username: formData.username,
        status: session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN'
            ? (formData.status as StatusUser)
            : (find.status as StatusUser),
        role: session?.user?.role === 'SUPER_ADMIN' ? (formData.role as Role) : (find.role as Role),
        fakultasId: formData.fakultasId ? Number(formData.fakultasId) : null,
    } as {
        name: string;
        username: string;
        status: StatusUser;
        role: Role;
        password?: string;
        fakultasId: number | null;
    };

    if (formData.password) {
        updateData.password = await hash(String(formData.password));
    }

    const updated = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    const find = await prisma.user.findUnique({ where: { id } });
    if (!find) return { error: 'User tidak ditemukan' };

    const updated = await prisma.user.update({
        where: { id },
        data: {
            status: find.status === 'ACTIVE' ? StatusUser.INACTIVE : StatusUser.ACTIVE
        },
    });

    return { success: true, data: updated };
}