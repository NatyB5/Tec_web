-- CreateTable
CREATE TABLE `CARTELA` (
    `id_cartela` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_jogo` INTEGER NOT NULL,

    PRIMARY KEY (`id_cartela`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JOGO` (
    `id_jogo` INTEGER NOT NULL AUTO_INCREMENT,
    `data_hora` DATETIME(0) NOT NULL,
    `id_sala` INTEGER NOT NULL,
    `id_usuario_vencedor` INTEGER NULL,
    `preco_cartela` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_jogo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NUMEROS_CARTELA` (
    `id_numero_cartela` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `id_cartela` INTEGER NOT NULL,

    PRIMARY KEY (`id_numero_cartela`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NUMEROS_SORTEADOS` (
    `id_numero_sorteado` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `ordem_sorteio` INTEGER NOT NULL,
    `id_jogo` INTEGER NOT NULL,

    PRIMARY KEY (`id_numero_sorteado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PREMIOS` (
    `id_premio` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(255) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `id_usuario` INTEGER NULL,
    `id_jogo` INTEGER NOT NULL,

    PRIMARY KEY (`id_premio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SALA` (
    `id_sala` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,

    PRIMARY KEY (`id_sala`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `USUARIO` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `creditos` DECIMAL(10, 2) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `USUARIO_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CARTELA` ADD CONSTRAINT `CARTELA_id_jogo_fkey` FOREIGN KEY (`id_jogo`) REFERENCES `JOGO`(`id_jogo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CARTELA` ADD CONSTRAINT `CARTELA_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIO`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JOGO` ADD CONSTRAINT `JOGO_id_sala_fkey` FOREIGN KEY (`id_sala`) REFERENCES `SALA`(`id_sala`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JOGO` ADD CONSTRAINT `JOGO_id_usuario_vencedor_fkey` FOREIGN KEY (`id_usuario_vencedor`) REFERENCES `USUARIO`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NUMEROS_CARTELA` ADD CONSTRAINT `NUMEROS_CARTELA_id_cartela_fkey` FOREIGN KEY (`id_cartela`) REFERENCES `CARTELA`(`id_cartela`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NUMEROS_SORTEADOS` ADD CONSTRAINT `NUMEROS_SORTEADOS_id_jogo_fkey` FOREIGN KEY (`id_jogo`) REFERENCES `JOGO`(`id_jogo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PREMIOS` ADD CONSTRAINT `PREMIOS_id_jogo_fkey` FOREIGN KEY (`id_jogo`) REFERENCES `JOGO`(`id_jogo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PREMIOS` ADD CONSTRAINT `PREMIOS_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIO`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
