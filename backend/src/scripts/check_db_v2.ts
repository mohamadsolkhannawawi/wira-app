import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.locationData.count();
  console.log("Total rows in location_data:", count);

  const sample = await prisma.locationData.findMany({
    where: { businessType: "CAFE" },
    select: { kelurahan: true },
    take: 5
  });
  console.log("Sample CAFE kelurahans:", sample.map(s => s.kelurahan));

  const tembalang = await prisma.locationData.findMany({
    where: { 
      kelurahan: { contains: "Tembalang", mode: "insensitive" },
      businessType: "CAFE"
    }
  });
  console.log("Found Tembalang for CAFE:", tembalang.length);
  if (tembalang.length > 0) {
    console.log("Exact name in DB:", tembalang[0].kelurahan);
  }
}

main().finally(() => prisma.$disconnect());
