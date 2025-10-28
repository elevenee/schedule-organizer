'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const user = await prisma.user.findUnique({
        where: { id }
    });
    if (!user) throw new Error("User not found");

    await prisma.user.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
    return true;
}