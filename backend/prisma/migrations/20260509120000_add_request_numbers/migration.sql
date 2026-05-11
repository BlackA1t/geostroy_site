CREATE SEQUENCE IF NOT EXISTS "Request_requestNumber_seq";

ALTER TABLE "Request"
ADD COLUMN "requestNumber" INTEGER;

WITH numbered_requests AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS row_number
  FROM "Request"
)
UPDATE "Request"
SET "requestNumber" = numbered_requests.row_number
FROM numbered_requests
WHERE "Request".id = numbered_requests.id;

SELECT setval(
  '"Request_requestNumber_seq"',
  GREATEST(COALESCE((SELECT MAX("requestNumber") FROM "Request"), 0), 1),
  true
);

ALTER TABLE "Request"
ALTER COLUMN "requestNumber" SET NOT NULL,
ALTER COLUMN "requestNumber" SET DEFAULT nextval('"Request_requestNumber_seq"');

ALTER SEQUENCE "Request_requestNumber_seq" OWNED BY "Request"."requestNumber";

CREATE UNIQUE INDEX "Request_requestNumber_key" ON "Request"("requestNumber");
