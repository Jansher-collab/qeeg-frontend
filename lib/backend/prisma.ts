/* eslint-disable @typescript-eslint/no-explicit-any */

function createMockPrismaClient(): any {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '$connect' || prop === '$disconnect') return async () => {};
        if (prop === 'then') return undefined;
        return new Proxy(
          () => Promise.resolve([]),
          {
            get: (_t, method) => {
              if (method === 'findUnique' || method === 'findFirst') return async () => null;
              if (method === 'findMany') return async () => [];
              if (method === 'create' || method === 'update' || method === 'upsert') {
                return async (args: any) => ({ id: 'mock-id', ...args.data });
              }
              if (method === 'delete') return async () => ({ id: 'mock-id' });
              return async () => null;
            },
          }
        );
      },
    }
  );
}

let prismaInstance: any;

try {
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('../../generated/prisma/client');
    prismaInstance = new PrismaClient({
      adapter: undefined as any,
    });
  } else {
    prismaInstance = createMockPrismaClient();
  }
} catch {
  prismaInstance = createMockPrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
