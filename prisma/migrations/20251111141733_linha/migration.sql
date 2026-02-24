/*
  Warnings:

  - Added the required column `linha` to the `bloqueio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bloqueio` ADD COLUMN `linha` VARCHAR(191) NOT NULL;
