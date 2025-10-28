'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const fakultas = await prisma.fakultas.findUnique({
        where: { id }
    });
    if (!fakultas) throw new Error("Fakultas not found");

    await prisma.fakultas.delete({
        where: { id }
    });
    return true;
}