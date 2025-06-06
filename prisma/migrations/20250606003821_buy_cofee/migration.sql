/*
  Warnings:

  - Added the required column `cardHolderName` to the `BankCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankCard" ADD COLUMN     "cardHolderName" TEXT NOT NULL;
