'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const program_studi = await prisma.jurusan.findUnique({
        where: { id }
    });
    if (!program_studi) throw new Error("Program studi not found");

    await prisma.jurusan.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return true;
}