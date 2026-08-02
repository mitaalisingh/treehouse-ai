import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Placeholder — add seed data here when needed.
  void prisma;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
