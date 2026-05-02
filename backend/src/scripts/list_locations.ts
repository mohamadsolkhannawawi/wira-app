import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const k = await prisma.locationData.findMany({
    distinct: ["kelurahan"],
    select: { kelurahan: true, kecamatan: true },
    take: 50
  });
  console.log("Available locations:");
  console.table(k);
}

main().finally(() => prisma.$disconnect());
