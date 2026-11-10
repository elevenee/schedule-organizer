'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Jenjang, Role } from "@prisma/client";
import { mataKuliahFormValues, mataKuliahSchema } from "../validations";

export async function update(id: number, formData: mataKuliahFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = mataKuliahSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi data mata kuliah gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.mataKuliah.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Mata kuliah tidak ditemukan' };

    const { nama, kode, sks, jurusanId, semester, jenjang, kurikulumId } = validated.data;
    const updateData = {
        nama,
        kode: kode || null,
        sks: Number(sks),
        semester: Number(semester),
        jurusanId: BigInt(jurusanId),
        ...(jenjang ? { jenjang: jenjang as Jenjang } : {}),
        kurikulumId: kurikulumId ? Number(kurikulumId) : null
    };

    const updated = await prisma.mataKuliah.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}
