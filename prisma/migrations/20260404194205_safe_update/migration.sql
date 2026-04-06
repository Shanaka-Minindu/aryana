/*
  Warnings:

  - The `district` column on the `DeliveryInfo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `salePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The `district` column on the `UserAddress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `shippingCost` to the `Order` table without a default value. This is not possible if the table is not empty.

*/


-- Step 1: add new column
ALTER TABLE "Product" ADD COLUMN "price_new" INTEGER;

-- Step 2: convert data
UPDATE "Product" SET "price_new" = (price * 100)::INTEGER;

-- Step 3: drop old column
ALTER TABLE "Product" DROP COLUMN "price";

-- Step 4: rename
ALTER TABLE "Product" RENAME COLUMN "price_new" TO "price";

UPDATE "DeliveryInfo"
SET district = UPPER(REPLACE(district, ' ', '_'));

-- backup


-- CreateEnum
CREATE TYPE "Districts" AS ENUM ('KANDY', 'MATALE', 'NUWARA_ELIYA', 'AMPARA', 'BATTICALOA', 'TRINCOMALEE', 'ANURADHAPURA', 'POLONNARUWA', 'KURUNEGALA', 'PUTTALAM', 'JAFFNA', 'KILINOCHCHI', 'MANNAR', 'MULLAITIVU', 'VAVUNIYA', 'KEGALLE', 'RATNAPURA', 'GALLE', 'HAMBANTOTA', 'MATARA', 'BADULLA', 'MONERAGALA', 'COLOMBO', 'GAMPAHA', 'KALUTARA');

-- AlterTable
ALTER TABLE "DeliveryInfo" ADD COLUMN     "additionalNote" TEXT,
DROP COLUMN "district",
ADD COLUMN     "district" "Districts" NOT NULL DEFAULT 'COLOMBO';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCost" INTEGER NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "salePrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "district",
ADD COLUMN     "district" "Districts" NOT NULL DEFAULT 'COLOMBO';

-- CreateTable
CREATE TABLE "ShippingCost" (
    "id" TEXT NOT NULL,
    "district" "Districts" NOT NULL,
    "cost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingCost_district_key" ON "ShippingCost"("district");
