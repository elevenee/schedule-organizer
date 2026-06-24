import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
    pool?: Pool;
    adapter?: PrismaPg;
};

type Context = {
    user?: {
        role: string;
    };
};

/* ---------------- SOFT DELETE ---------------- */
function softDeleteHandlers() {
    return {
        async findMany({ args, query, ctx }: any) {
            if (ctx?.user?.role === 'ADMIN') return query(args);

            args.where = {
                ...args.where,
                deletedAt: null,
            };

            return query(args);
        },

        async findFirst({ args, query, ctx }: any) {
            const withDeleted = args?.withDeleted === true;

            if (ctx?.user?.role === 'ADMIN' || withDeleted) {
                delete args.withDeleted;
                return query(args);
            }

            args.where = {
                ...args.where,
                deletedAt: null,
            };

            return query(args);
        },

        async findUnique({ args, query, ctx }: any) {
            const withDeleted = args?.withDeleted === true;

            if (ctx?.user?.role === 'ADMIN' || withDeleted) {
                delete args.withDeleted;
                return query(args);
            }

            args.where = {
                ...args.where,
                deletedAt: null,
            };

            return query(args);
        },
    };
}

/* ---------------- SINGLETON SAFE ---------------- */
function getPrismaClient(): PrismaClient {
    if (!globalForPrisma.pool) {
        globalForPrisma.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    if (!globalForPrisma.adapter) {
        globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
    }

    const client = new PrismaClient({
        adapter: globalForPrisma.adapter,
        log:
            process.env.NODE_ENV !== 'production'
                ? ['query', 'error', 'warn']
                : ['error'],
    });

    return client.$extends({
        name: 'softDelete',
        query: {
            user: softDeleteHandlers(),
        },
    }) as PrismaClient;
}

/* ---------------- EXPORT ---------------- */
export const prisma =
    globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}