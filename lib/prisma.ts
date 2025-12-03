import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Optional: Context untuk akses role
type Context = {
    user?: {
        role: string;
    };
};

// Soft delete handler
function softDeleteHandlers() {
    return {
        async findMany({
            args,
            query,
            ctx,
        }: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: any;
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query: (args: any) => Promise<any>;
            ctx?: Context;
        }) {
            if (ctx?.user?.role === 'SUPERADMIN') {
                return query(args);
            }

            args.where = {
                ...args.where,
                deletedAt: null,
            };
            return query(args);
        },

        async findFirst({
            args,
            query,
            ctx,
        }: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: any;
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query: (args: any) => Promise<any>;
            ctx?: Context;
        }) {
            const showDeleted = args?.showDeleted === true;
            if (ctx?.user?.role === 'SUPERADMIN' || showDeleted) {
                delete args.showDeleted;
                return query(args);
            }

            args.where = {
                ...args.where,
                deletedAt: null,
            };
            return query(args);
        },

        async findUnique({
            args,
            query,
            ctx,
        }: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: any;
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query: (args: any) => Promise<any>;
            ctx?: Context;
        }) {
            const showDeleted = args?.showDeleted === true;
            if (ctx?.user?.role === 'SUPERADMIN' || showDeleted) {
                delete args.showDeleted;
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

// Extend Prisma client with soft delete logic
function getExtendedClient(): PrismaClient {
    const client = new PrismaClient({
        log: process.env.NODE_ENV !== 'production'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

    const extended = client.$extends({
        name: 'softDelete',
        query: {
            user: softDeleteHandlers(),
        },
    });

    return extended as PrismaClient;
}

// Export prisma instance (singleton di dev)
export const prisma =
    globalForPrisma.prisma ?? (globalForPrisma.prisma = getExtendedClient());
