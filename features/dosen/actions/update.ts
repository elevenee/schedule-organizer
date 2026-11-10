'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, TypeDosen } from "@prisma/client";
import { dosenFormValues, dosenSchema, PhoneValues, phoneSchema } from "../validations";

export async function update(id: number, formData: dosenFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = dosenSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi data dosen gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.dosen.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Dosen tidak ditemukan' };

    const { nama, nidn, fakultasId, jurusanId, status } = validated.data;
    const updateData = {
        nama,
        nidn: nidn || null,
        fakultasId: fakultasId ? BigInt(fakultasId) : null,
        jurusanId: jurusanId ? BigInt(jurusanId) : null,
        status: status as TypeDosen
    };

    const updated = await prisma.dosen.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateNoHp(id: number, formData: PhoneValues) {
    await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    const validated = phoneSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Nomor HP tidak valid' };
    }

    const find = await prisma.dosen.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Dosen tidak ditemukan' };
    
    const { no_hp } = validated.data;
    const updateData = {
        no_hp: no_hp || null,
    };

    const updated = await prisma.dosen.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}
