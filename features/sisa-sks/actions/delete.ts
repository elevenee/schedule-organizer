'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const sisaSks = await prisma.sisaSks.findUnique({
        where: { id }
    });
    if (!sisaSks) throw new Error("Sisa SKS not found");

    await prisma.sisaSks.delete({
        where: { id }
    });

    return true;
}