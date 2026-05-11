-- CreateTable
CREATE TABLE "CallbackRequestStatusHistory" (
    "id" TEXT NOT NULL,
    "callbackRequestId" TEXT NOT NULL,
    "oldStatus" "CallbackStatus",
    "newStatus" "CallbackStatus" NOT NULL,
    "comment" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallbackRequestStatusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CallbackRequestStatusHistory" ADD CONSTRAINT "CallbackRequestStatusHistory_callbackRequestId_fkey" FOREIGN KEY ("callbackRequestId") REFERENCES "CallbackRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallbackRequestStatusHistory" ADD CONSTRAINT "CallbackRequestStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
