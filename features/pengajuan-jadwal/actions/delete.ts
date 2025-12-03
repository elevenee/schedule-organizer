'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const jadwal = await prisma.jadwalRequest.findUnique({
        where: { id }
    });
    
    if (!jadwal) throw new Error("Jadwal not found");
    await prisma.jadwalRequest.delete({
        where: { id }
    });

    return true;
}