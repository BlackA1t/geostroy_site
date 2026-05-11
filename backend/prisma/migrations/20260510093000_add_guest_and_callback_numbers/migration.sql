CREATE SEQUENCE IF NOT EXISTS "GuestRequest_guestRequestNumber_seq";

ALTER TABLE "GuestRequest"
ADD COLUMN "guestRequestNumber" INTEGER;

WITH numbered_guest_requests AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS row_number
  FROM "GuestRequest"
)
UPDATE "GuestRequest"
SET "guestRequestNumber" = numbered_guest_requests.row_number
FROM numbered_guest_requests
WHERE "GuestRequest".id = numbered_guest_requests.id;

SELECT setval(
  '"GuestRequest_guestRequestNumber_seq"',
  GREATEST(COALESCE((SELECT MAX("guestRequestNumber") FROM "GuestRequest"), 0), 1),
  true
);

ALTER TABLE "GuestRequest"
ALTER COLUMN "guestRequestNumber" SET NOT NULL,
ALTER COLUMN "guestRequestNumber" SET DEFAULT nextval('"GuestRequest_guestRequestNumber_seq"');

ALTER SEQUENCE "GuestRequest_guestRequestNumber_seq" OWNED BY "GuestRequest"."guestRequestNumber";

CREATE UNIQUE INDEX "GuestRequest_guestRequestNumber_key" ON "GuestRequest"("guestRequestNumber");

CREATE SEQUENCE IF NOT EXISTS "CallbackRequest_callbackRequestNumber_seq";

ALTER TABLE "CallbackRequest"
ADD COLUMN "callbackRequestNumber" INTEGER;

WITH numbered_callback_requests AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS row_number
  FROM "CallbackRequest"
)
UPDATE "CallbackRequest"
SET "callbackRequestNumber" = numbered_callback_requests.row_number
FROM numbered_callback_requests
WHERE "CallbackRequest".id = numbered_callback_requests.id;

SELECT setval(
  '"CallbackRequest_callbackRequestNumber_seq"',
  GREATEST(COALESCE((SELECT MAX("callbackRequestNumber") FROM "CallbackRequest"), 0), 1),
  true
);

ALTER TABLE "CallbackRequest"
ALTER COLUMN "callbackRequestNumber" SET NOT NULL,
ALTER COLUMN "callbackRequestNumber" SET DEFAULT nextval('"CallbackRequest_callbackRequestNumber_seq"');

ALTER SEQUENCE "CallbackRequest_callbackRequestNumber_seq" OWNED BY "CallbackRequest"."callbackRequestNumber";

CREATE UNIQUE INDEX "CallbackRequest_callbackRequestNumber_key" ON "CallbackRequest"("callbackRequestNumber");
