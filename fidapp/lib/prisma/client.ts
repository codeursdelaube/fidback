// Prisma Client Singleton
// Ready for live PostgreSQL connection with Supabase

type AnyPrisma = any;

let PrismaClientConstructor: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clientPkg = require("@prisma/client");
  PrismaClientConstructor = clientPkg.PrismaClient;
} catch {
  PrismaClientConstructor = class MockPrismaClient {};
}

const globalForPrisma = globalThis as unknown as {
  prisma: AnyPrisma | undefined;
};

export const prisma: AnyPrisma =
  globalForPrisma.prisma ??
  (PrismaClientConstructor
    ? new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
    : {});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
