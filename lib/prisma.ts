import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Polyfill BigInt serialization to prevent Next.js / JSON serialization errors
if (typeof BigInt !== 'undefined') {
    (BigInt.prototype as any).toJSON = function () {
        const int = Number(this);
        return Number.isSafeInteger(int) ? int : this.toString();
    };
}

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
            max: 20,                       // Maksimal 20 koneksi concurrent
            idleTimeoutMillis: 30000,      // Tutup koneksi idle setelah 30 detik
            connectionTimeoutMillis: 5000, // Timeout koneksi 5 detik jika pool jenuh
        });
    }

    if (!globalForPrisma.adapter) {
        globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
    }

    const client = new PrismaClient({
        adapter: globalForPrisma.adapter,
        log:
            process.env.NODE_ENV !== 'production'
                ? ['error', 'warn']
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

// Selalu simpan di globalThis agar tidak merekonstruksi instance koneksi di server runtime
globalForPrisma.prisma = prisma;
