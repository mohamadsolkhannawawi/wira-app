import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.locationData.findMany({ take: 1 });
  console.log("Full DB record sample:", JSON.stringify(all[0], null, 2));

  const nullLat = await prisma.locationData.count({ where: { latCentroid: null as any } });
  const nullLng = await prisma.locationData.count({ where: { lngCentroid: null as any } });
  console.log("Null lat:", nullLat, "Null lng:", nullLng);
}

main().finally(() => prisma.$disconnect());
