import { prisma } from "@/lib/prisma";

export default async function FIND_BY_ID(id: number) {
    const result = await prisma.fakultas.findUnique({
        where: {
            id: id
        }
    })

    if (!result) {
        throw Error("Fakultas tidak ditemukan")
    }

    return result;
}