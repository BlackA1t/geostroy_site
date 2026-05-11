DELETE FROM "RequestStatusHistory"
WHERE "oldStatus" = 'CALCULATED'
   OR "newStatus" = 'CALCULATED';

UPDATE "Request"
SET "status" = 'IN_PROGRESS'
WHERE "status" = 'CALCULATED';

UPDATE "GuestRequest"
SET "status" = 'IN_PROGRESS'
WHERE "status" = 'CALCULATED';

ALTER TABLE "Request"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "GuestRequest"
ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "RequestStatus_new" AS ENUM (
  'NEW',
  'IN_PROGRESS',
  'NEED_INFO',
  'COMPLETED',
  'CANCELLED'
);

ALTER TABLE "Request"
ALTER COLUMN "status" TYPE "RequestStatus_new"
USING "status"::text::"RequestStatus_new";

ALTER TABLE "GuestRequest"
ALTER COLUMN "status" TYPE "RequestStatus_new"
USING "status"::text::"RequestStatus_new";

ALTER TABLE "RequestStatusHistory"
ALTER COLUMN "oldStatus" TYPE "RequestStatus_new"
USING "oldStatus"::text::"RequestStatus_new";

ALTER TABLE "RequestStatusHistory"
ALTER COLUMN "newStatus" TYPE "RequestStatus_new"
USING "newStatus"::text::"RequestStatus_new";

DROP TYPE "RequestStatus";

ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";

ALTER TABLE "Request"
ALTER COLUMN "status" SET DEFAULT 'NEW';

ALTER TABLE "GuestRequest"
ALTER COLUMN "status" SET DEFAULT 'NEW';
