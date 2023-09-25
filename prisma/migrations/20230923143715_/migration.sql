/*
  Warnings:

  - The primary key for the `OrderItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OrderItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("order_id", "item_id");
