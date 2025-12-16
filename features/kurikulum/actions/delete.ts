'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const kurikulum = await prisma.kurikulum.findUnique({
        where: { id }
    });

    if (!kurikulum) throw new Error("Kurikulum not found");

    await prisma.kurikulum.delete({
        where: { id }
    });

    return true;
}