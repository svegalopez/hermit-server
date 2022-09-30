-- CreateTable
CREATE TABLE `UserLogin` (
    `userId` INTEGER NOT NULL,
    `agentKey` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserLogin_userId_agentKey_key`(`userId`, `agentKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserLogin` ADD CONSTRAINT `UserLogin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
