'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const program_studi = await prisma.programStudi.findUnique({
        where: { id }
    });
    if (!program_studi) throw new Error("Program studi not found");

    await prisma.programStudi.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
    return true;
}