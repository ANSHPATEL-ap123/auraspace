-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "captureDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "bortleClass" INTEGER,
    "cameraBody" TEXT NOT NULL,
    "lensTelescope" TEXT NOT NULL,
    "focalLength" TEXT NOT NULL,
    "iso" TEXT NOT NULL,
    "shutterSpeed" TEXT NOT NULL,
    "aperture" TEXT NOT NULL,
    "whiteBalance" TEXT NOT NULL,
    "focusMode" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "stackedFrames" INTEGER,
    "calibration" BOOLEAN NOT NULL DEFAULT false,
    "processing" TEXT,
    "auraScore" DOUBLE PRECISION,
    "imageUrl" TEXT NOT NULL,
    "posterPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ObservationLog_userId_idx" ON "ObservationLog"("userId");

-- AddForeignKey
ALTER TABLE "ObservationLog" ADD CONSTRAINT "ObservationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
