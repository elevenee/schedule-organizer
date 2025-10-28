-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FAKULTAS', 'PRODI', 'DOSEN');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TypeDosen" AS ENUM ('TETAP', 'TIDAK_TETAP');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "username" VARCHAR(16) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'DOSEN',
    "status" "StatusUser" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TahunAkademik" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TahunAkademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengaturanJadwal" (
    "id" BIGSERIAL NOT NULL,
    "jenisDoses" "TypeDosen" NOT NULL DEFAULT 'TIDAK_TETAP',
    "minSks" DECIMAL(10,2) NOT NULL,
    "maxSks" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PengaturanJadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fakultas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "isPascasarjana" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurusan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dosen" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nidn" TEXT,
    "fakultasId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "sks" INTEGER NOT NULL,
    "jurusanId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" SERIAL NOT NULL,
    "tahunAkademik" TEXT NOT NULL,
    "mataKuliahId" INTEGER NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "kelas" TEXT[],
    "totalSks" VARCHAR(10) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_nama_key" ON "Fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_kode_key" ON "Fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Jurusan_nama_fakultasId_key" ON "Jurusan"("nama", "fakultasId");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nidn_key" ON "Dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_nama_jurusanId_key" ON "MataKuliah"("nama", "jurusanId");

-- AddForeignKey
ALTER TABLE "Jurusan" ADD CONSTRAINT "Jurusan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MataKuliah" ADD CONSTRAINT "MataKuliah_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
