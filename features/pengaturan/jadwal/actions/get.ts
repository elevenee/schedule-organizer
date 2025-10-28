'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    jenisDosen= ""
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean, jenisDosen?: string }) {
    const skip = (page - 1) * limit;
    const jenisDosenFIlter = search
        ? { jenisDosen: jenisDosen as TypeDosen }
        : {};
    
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    let withDeleted = { deletedAt: null } as any;
    if (user?.user?.role !== 'ADMIN') {
        withDeleted = {};
    }

    const where = {
        ...jenisDosenFIlter,
        ...withDeleted
    };

    const [data, total] = await Promise.all([
        prisma.pengaturanJadwal.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
        }),
        prisma.pengaturanJadwal.count({ where }),
    ]);

    return { data: data.map((m:any)=>{
        return {
            ...m,
            minSks: m.minSks.toFixed(0),
            maxSks: m.maxSks.toFixed(0),
        }
    }), total };
}

export default async function GET_ALL() {
    const result = await prisma.pengaturanJadwal.findMany({
        orderBy: { jenisDosen: 'desc' }
    });

    return result;
}