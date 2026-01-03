-- CreateTable
CREATE TABLE "auction_settings" (
    "id" TEXT NOT NULL,
    "autoExtendThreshold" INTEGER NOT NULL DEFAULT 5,
    "autoExtendDuration" INTEGER NOT NULL DEFAULT 10,
    "autoExtendDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_settings_pkey" PRIMARY KEY ("id")
);
