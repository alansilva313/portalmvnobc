/*
  Warnings:

  - Added the required column `tipo_bloqueio` to the `bloqueio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bloqueio` ADD COLUMN `tipo_bloqueio` VARCHAR(191) NOT NULL;
