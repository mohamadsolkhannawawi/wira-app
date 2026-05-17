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
};
