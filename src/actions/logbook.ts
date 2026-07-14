'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveObservationLog(formData: {
  targetName: string;
  captureDate: string;
  location: string;
  bortleClass?: number;
  cameraBody: string;
  lensTelescope: string;
  focalLength: string;
  iso: string;
  shutterSpeed: string;
  aperture: string;
  whiteBalance: string;
  focusMode: string;
  imageType: string;
  stackedFrames?: number;
  calibration: boolean;
  processing?: string;
  auraScore?: number;
  imageUrl: string;
}) {
  // 1. Authenticate the session securely on the server
  const session = await auth();
  const user = await currentUser();
  
  if (!session.userId || !user) {
    throw new Error("Unauthorized access request to AuraSpace core.");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress || "";

  try {
    // 2. Ensure the user exists in our local PostgreSQL database first
    const dbUser = await prisma.user.upsert({
      where: { email: primaryEmail },
      update: {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatarUrl: user.imageUrl,
      },
      create: {
        id: session.userId, // Link Clerk ID directly to DB primary key
        email: primaryEmail,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatarUrl: user.imageUrl,
      },
    });

    // 3. Insert the observation log linked directly to the authenticated user
    const savedLog = await prisma.observationLog.create({
      data: {
        userId: dbUser.id,
        targetName: formData.targetName,
        captureDate: new Date(formData.captureDate),
        location: formData.location,
        bortleClass: formData.bortleClass,
        cameraBody: formData.cameraBody,
        lensTelescope: formData.lensTelescope,
        focalLength: formData.focalLength,
        iso: formData.iso,
        shutterSpeed: formData.shutterSpeed,
        aperture: formData.aperture,
        whiteBalance: formData.whiteBalance,
        focusMode: formData.focusMode,
        imageType: formData.imageType,
        stackedFrames: formData.stackedFrames,
        calibration: formData.calibration,
        processing: formData.processing,
        auraScore: formData.auraScore,
        imageUrl: formData.imageUrl,
      },
    });

    // 4. Refresh the page data smoothly
    revalidatePath('/laboratory');
    return { success: true, logId: savedLog.id };

  } catch (error) {
    console.error("Backend database write failure:", error);
    return { success: false, error: "Failed to persist telescope logs." };
  }
}