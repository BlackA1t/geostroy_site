-- AlterTable
ALTER TABLE "RequestFile" ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "sizeBytes" INTEGER;

-- CreateTable
CREATE TABLE "GuestRequestFile" (
    "id" TEXT NOT NULL,
    "guestRequestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "originalName" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestRequestFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuestRequestFile" ADD CONSTRAINT "GuestRequestFile_guestRequestId_fkey" FOREIGN KEY ("guestRequestId") REFERENCES "GuestRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
