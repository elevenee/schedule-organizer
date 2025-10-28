'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const mataKuliah = await prisma.mataKuliah.findUnique({
        where: { id }
    });
    if (!mataKuliah) throw new Error("Mata Kuliah not found");
    if (mataKuliah.deletedAt) {
        await prisma.mataKuliah.delete({
            where: { id }
        });
    } else {
        await prisma.mataKuliah.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}