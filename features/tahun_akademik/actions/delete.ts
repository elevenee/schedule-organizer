'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const tahunAkademik = await prisma.tahunAkademik.findUnique({
        where: { id }
    });
    if (!tahunAkademik) throw new Error("Tahun Akademik not found");
    if (tahunAkademik.deletedAt) {
        await prisma.tahunAkademik.delete({
            where: { id }
        });
    } else {
        await prisma.tahunAkademik.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}