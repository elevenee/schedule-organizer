'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const jadwal = await prisma.jadwal.findUnique({
        where: { id }
    });
    if (!jadwal) throw new Error("Mata Kuliah not found");
    await prisma.jadwal.delete({
        where: { id }
    });

    return true;
}