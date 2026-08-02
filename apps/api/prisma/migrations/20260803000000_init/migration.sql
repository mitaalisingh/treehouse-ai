-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SketchFileType" AS ENUM ('png', 'jpg', 'svg');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "oauthProvider" TEXT,
    "oauthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sketches" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "SketchFileType" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sketches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_trees" (
    "id" TEXT NOT NULL,
    "sketchId" TEXT NOT NULL,
    "jsonData" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_trees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthProvider_oauthId_key" ON "users"("oauthProvider", "oauthId");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "sketches_projectId_idx" ON "sketches"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "component_trees_sketchId_key" ON "component_trees"("sketchId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_trees" ADD CONSTRAINT "component_trees_sketchId_fkey" FOREIGN KEY ("sketchId") REFERENCES "sketches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
