-- CreateTable
CREATE TABLE "GlobalSerial" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastSerial" INTEGER NOT NULL,

    CONSTRAINT "GlobalSerial_pkey" PRIMARY KEY ("id")
);

-- Initialize GlobalSerial
INSERT INTO "GlobalSerial" (id, "lastSerial") VALUES (1, 0);
