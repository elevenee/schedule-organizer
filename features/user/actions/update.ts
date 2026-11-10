'use server';

import { requireAuth } from "@/lib/auth-guard";
import { hash } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { Role, StatusUser } from "@prisma/client";
import { userFormValues, userSchema } from "../validations";

export async function update(id: number, formData: userFormValues) {
    const session = await requireAuth();
    const isAdmin = session.user.role === Role.ADMIN;
    const isSelf = String(session.user.id) === String(id);

    if (!isAdmin && !isSelf) {
        throw new Error('FORBIDDEN: Anda tidak memiliki izin untuk mengubah data pengguna ini');
    }

    const validated = userSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi data gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'User tidak ditemukan' };

    // Check if new username is already used by another user
    if (validated.data.username !== find.username) {
        const duplicateUsername = await prisma.user.findUnique({
            where: { username: validated.data.username }
        });
        if (duplicateUsername && duplicateUsername.id !== BigInt(id)) {
            return { error: 'Username sudah digunakan oleh akun lain' };
        }
    }

    const updateData: {
        name: string;
        username: string;
        status?: StatusUser;
        role?: Role;
        password?: string;
        fakultasId?: bigint | null;
    } = {
        name: validated.data.name,
        username: validated.data.username,
    };

    if (isAdmin) {
        updateData.status = (validated.data.status as StatusUser) || find.status;
        updateData.role = (validated.data.role as Role) || find.role;
        updateData.fakultasId = validated.data.fakultasId ? BigInt(validated.data.fakultasId) : null;
    }

    if (validated.data.password && validated.data.password.trim() !== '') {
        updateData.password = await hash(String(validated.data.password));
    }

    const updated = await prisma.user.update({
        where: { id: BigInt(id) },
        data: updateData,
        select: {
            id: true,
            name: true,
            username: true,
            role: true,
            status: true,
            fakultasId: true,
            updatedAt: true,
        }
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    const session = await requireAuth([Role.ADMIN]);

    if (String(session.user.id) === String(id)) {
        return { error: 'Anda tidak dapat menonaktifkan akun Anda sendiri' };
    }

    const find = await prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'User tidak ditemukan' };

    const newStatus = find.status === StatusUser.ACTIVE ? StatusUser.INACTIVE : StatusUser.ACTIVE;

    const updated = await prisma.user.update({
        where: { id: BigInt(id) },
        data: {
            status: newStatus
        },
        select: {
            id: true,
            status: true,
        }
    });

    return { success: true, data: updated };
}
