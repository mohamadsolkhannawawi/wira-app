import prisma from "../config/database.js";
import type { Prisma, StreetLocation } from "@prisma/client";

export const locationRepository = {
  async listKecamatans(query?: string): Promise<string[]> {
    const where: Prisma.StreetLocationWhereInput = query
      ? { kecamatan: { contains: query, mode: "insensitive" } }
      : {};

    const results = await prisma.streetLocation.findMany({
      where,
      select: { kecamatan: true },
      distinct: ["kecamatan"],
      orderBy: { kecamatan: "asc" },
    });

    return results.map((row) => row.kecamatan);
  },

  async listKelurahans(query?: string): Promise<string[]> {
    const where: Prisma.StreetLocationWhereInput = query
      ? { kelurahan: { contains: query, mode: "insensitive" } }
      : {};

    const results = await prisma.streetLocation.findMany({
      where,
      select: { kelurahan: true },
      distinct: ["kelurahan"],
      orderBy: { kelurahan: "asc" },
    });

    return results.map((row) => row.kelurahan);
  },

  async listStreetsByKelurahan(
    kelurahan: string,
    query?: string,
  ): Promise<string[]> {
    const where: Prisma.StreetLocationWhereInput = {
      kelurahan: { equals: kelurahan, mode: "insensitive" },
    };

    if (query) {
      where.namaJalan = { contains: query, mode: "insensitive" };
    }

    const results = await prisma.streetLocation.findMany({
      where,
      select: { namaJalan: true },
      distinct: ["namaJalan"],
      orderBy: { namaJalan: "asc" },
    });

    return results.map((row) => row.namaJalan);
  },

  async searchStreets(
    query: string,
    limit: number = 10,
  ): Promise<StreetLocation[]> {
    return prisma.streetLocation.findMany({
      where: { namaJalan: { contains: query, mode: "insensitive" } },
      orderBy: { namaJalan: "asc" },
      take: limit,
    });
  },

  async findNearestLocation(userLat: number, userLng: number) {
    const locations = await prisma.streetLocation.findMany({
      distinct: ["kelurahan"],
      select: { kelurahan: true, kecamatan: true, latCentroid: true, lngCentroid: true },
    });

    let nearest = null;
    let minDistance = Infinity;

    const toRad = (x: number) => (x * Math.PI) / 180;
    
    for (const loc of locations) {
      const R = 6371; // km
      const dLat = toRad(loc.latCentroid - userLat);
      const dLng = toRad(loc.lngCentroid - userLng);
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) * Math.cos(toRad(loc.latCentroid)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance < minDistance) {
        minDistance = distance;
        nearest = loc;
      }
    }

    return { nearest, distanceKm: minDistance };
  },
};
