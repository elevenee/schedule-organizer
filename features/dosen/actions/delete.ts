'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const dosen = await prisma.dosen.findUnique({
        where: { id }
    });
    if (!dosen) throw new Error("Dosen not found");
    if (dosen.deletedAt) {
        await prisma.dosen.delete({
            where: { id }
        });
    } else {
        await prisma.dosen.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}