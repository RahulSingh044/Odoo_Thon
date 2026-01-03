/*
  Warnings:

  - You are about to drop the column `fullName` on the `EmployeeProfile` table. All the data in the column will be lost.
  - Added the required column `name` to the `EmployeeProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeProfile" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;
