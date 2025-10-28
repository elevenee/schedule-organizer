import { prisma } from "@/lib/prisma";

export default async function FIND_BY_ID(id: number) {
    const result = await prisma.programStudi.findUnique({
        where: {
            id: id
        }
    })

    if (!result) {
        throw Error("Program studi tidak ditemukan")
    }

    return result;
}