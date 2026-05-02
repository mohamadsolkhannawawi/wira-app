import prisma from "../config/database.js";
import type { LocationData, Prisma } from "@prisma/client";
import { BusinessType, ClusterLabel } from "@prisma/client";

interface LocationFilters {
    businessType?: string;
    kecamatan?: string;
    clusterLabel?: string;
    sort?: string;
    order?: string;
    page?: string;
    limit?: string;
}

export const locationRepository = {
    async findAll(filters: LocationFilters = {}): Promise<LocationData[]> {
        const where: Prisma.LocationDataWhereInput = {};

        if (filters.businessType && filters.businessType in BusinessType) {
            where.businessType = filters.businessType as BusinessType;
        }
        if (filters.kecamatan) {
            where.kecamatan = {
                equals: filters.kecamatan,
                mode: "insensitive",
            };
        }
        if (filters.clusterLabel && filters.clusterLabel in ClusterLabel) {
            where.clusterLabel = filters.clusterLabel as ClusterLabel;
        }

        const page = Math.max(1, parseInt(filters.page ?? "1", 10));
        const limit = Math.min(
            100,
            Math.max(1, parseInt(filters.limit ?? "50", 10)),
        );
        const orderField = filters.sort === "name" ? "kelurahan" : "finalScore";
        const orderDir =
            filters.order === "asc" ? ("asc" as const) : ("desc" as const);

        return prisma.locationData.findMany({
            where,
            orderBy: { [orderField]: orderDir },
            skip: (page - 1) * limit,
            take: limit,
        });
    },

    async findByKelurahan(
        kelurahan: string,
        businessType?: string,
    ): Promise<LocationData[]> {
        const where: Prisma.LocationDataWhereInput = {
            kelurahan: { equals: kelurahan, mode: "insensitive" },
        };
        if (businessType && businessType in BusinessType) {
            where.businessType = businessType as BusinessType;
        }
        return prisma.locationData.findMany({ where });
    },

    async findByKelurahanAndType(
        kelurahan: string,
        businessType: string,
    ): Promise<LocationData | null> {
        const results = await prisma.locationData.findMany({
            where: {
                kelurahan: { equals: kelurahan, mode: "insensitive" },
                businessType: businessType as BusinessType,
            },
            take: 1,
        });
        return results[0] ?? null;
    },

    async compareLocations(
        kelurahans: string[],
        businessType: string,
    ): Promise<LocationData[]> {
        return prisma.locationData.findMany({
            where: {
                kelurahan: { in: kelurahans, mode: "insensitive" },
                businessType: businessType as BusinessType,
            },
            orderBy: { finalScore: "desc" },
        });
    },

    async findTopLocations(
        businessType: string,
        limit: number = 10,
    ): Promise<LocationData[]> {
        return prisma.locationData.findMany({
            where: {
                businessType: businessType as BusinessType,
                clusterLabel: "POTENSIAL",
            },
            orderBy: { finalScore: "desc" },
            take: limit,
        });
    },

    async countByFilters(filters: LocationFilters = {}): Promise<number> {
        const where: Prisma.LocationDataWhereInput = {};
        if (filters.businessType && filters.businessType in BusinessType) {
            where.businessType = filters.businessType as BusinessType;
        }
        if (filters.kecamatan) {
            where.kecamatan = {
                equals: filters.kecamatan,
                mode: "insensitive",
            };
        }
        return prisma.locationData.count({ where });
    },
    async findUniqueKelurahans(query?: string): Promise<string[]> {
        const where: Prisma.LocationDataWhereInput = query
            ? { kelurahan: { contains: query, mode: "insensitive" } }
            : {};

        const results = await prisma.locationData.findMany({
            where,
            select: { kelurahan: true },
            distinct: ["kelurahan"],
            take: 500, // Sufficient for all kelurahans in a city
            orderBy: { kelurahan: "asc" },
        });

        return results.map((r) => r.kelurahan);
    },
};
