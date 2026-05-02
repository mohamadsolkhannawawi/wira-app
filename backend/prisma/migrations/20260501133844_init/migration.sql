-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('CAFE', 'LAUNDRY', 'FNB', 'BARBERSHOP', 'SALON', 'GYM', 'BENGKEL', 'CARWASH', 'FASHION', 'ELEKTRONIK', 'PHOTOSTUDIO', 'STATIONERY');

-- CreateEnum
CREATE TYPE "ClusterLabel" AS ENUM ('RAMAI', 'POTENSIAL', 'SEPI');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('TINGGI', 'SEDANG', 'RENDAH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "businessType" "BusinessType" NOT NULL,
    "resultScore" DOUBLE PRECISION NOT NULL,
    "clusterLabel" "ClusterLabel" NOT NULL,
    "insight" TEXT NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "locationName" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "trafficScore" DOUBLE PRECISION NOT NULL,
    "transitScore" DOUBLE PRECISION NOT NULL,
    "poiScore" DOUBLE PRECISION NOT NULL,
    "competitorScore" DOUBLE PRECISION NOT NULL,
    "compRatio" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_data" (
    "id" TEXT NOT NULL,
    "namaJalan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "latCentroid" DOUBLE PRECISION NOT NULL,
    "lngCentroid" DOUBLE PRECISION NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "trafficScore" DOUBLE PRECISION NOT NULL,
    "transitScore" DOUBLE PRECISION NOT NULL,
    "poiScore" DOUBLE PRECISION NOT NULL,
    "competitorCount" DOUBLE PRECISION NOT NULL,
    "compRatio" DOUBLE PRECISION NOT NULL,
    "clusterLabel" "ClusterLabel" NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "dataVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_type_masters" (
    "id" TEXT NOT NULL,
    "code" "BusinessType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "weightTraffic" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "weightTransit" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "weightPoi" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "weightCompetitor" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "weightCompRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.15,

    CONSTRAINT "business_type_masters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "location_data_kelurahan_businessType_key" ON "location_data"("kelurahan", "businessType");

-- CreateIndex
CREATE UNIQUE INDEX "business_type_masters_code_key" ON "business_type_masters"("code");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_histories" ADD CONSTRAINT "search_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
