-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('MESTRE', 'JOGADOR');

-- CreateEnum
CREATE TYPE "Visibilidade" AS ENUM ('PUBLICO', 'MESTRE');

-- CreateEnum
CREATE TYPE "SituacaoCampanha" AS ENUM ('PLANEJADA', 'ATIVA', 'PAUSADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TipoEntidade" AS ENUM ('PERSONAGEM', 'NPC', 'LUGAR', 'FACCAO', 'ITEM', 'MAGIA', 'CRIATURA', 'DIVINDADE', 'EVENTO', 'FAMILIA', 'OUTRO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "avatarUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "donoId" UUID NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sistemas" (
    "id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sistemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "universoId" UUID NOT NULL,
    "sistemaId" UUID NOT NULL,
    "situacao" "SituacaoCampanha" NOT NULL DEFAULT 'PLANEJADA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participacoes" (
    "id" UUID NOT NULL,
    "campanhaId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'JOGADOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidades" (
    "id" UUID NOT NULL,
    "universoId" UUID NOT NULL,
    "tipo" "TipoEntidade" NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumo" TEXT,
    "corpo" TEXT,
    "imagemUrl" TEXT,
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'PUBLICO',
    "criadoPorId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campos_entidade" (
    "id" UUID NOT NULL,
    "entidadeId" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'PUBLICO',
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "campos_entidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculos" (
    "id" UUID NOT NULL,
    "origemId" UUID NOT NULL,
    "destinoId" UUID NOT NULL,
    "rotulo" TEXT NOT NULL,
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'PUBLICO',

    CONSTRAINT "vinculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personagens" (
    "id" UUID NOT NULL,
    "campanhaId" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "entidadeId" UUID,
    "nome" TEXT NOT NULL,
    "dados" JSONB NOT NULL DEFAULT '{}',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" UUID NOT NULL,
    "campanhaId" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "resumoPublico" TEXT,
    "notasMestre" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "universos_slug_key" ON "universos"("slug");

-- CreateIndex
CREATE INDEX "universos_donoId_idx" ON "universos"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "sistemas_chave_key" ON "sistemas"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "campanhas_slug_key" ON "campanhas"("slug");

-- CreateIndex
CREATE INDEX "campanhas_universoId_idx" ON "campanhas"("universoId");

-- CreateIndex
CREATE INDEX "campanhas_sistemaId_idx" ON "campanhas"("sistemaId");

-- CreateIndex
CREATE INDEX "participacoes_usuarioId_idx" ON "participacoes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "participacoes_campanhaId_usuarioId_key" ON "participacoes"("campanhaId", "usuarioId");

-- CreateIndex
CREATE INDEX "entidades_universoId_tipo_idx" ON "entidades"("universoId", "tipo");

-- CreateIndex
CREATE INDEX "entidades_nome_idx" ON "entidades"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "entidades_universoId_slug_key" ON "entidades"("universoId", "slug");

-- CreateIndex
CREATE INDEX "campos_entidade_entidadeId_visibilidade_idx" ON "campos_entidade"("entidadeId", "visibilidade");

-- CreateIndex
CREATE UNIQUE INDEX "campos_entidade_entidadeId_chave_key" ON "campos_entidade"("entidadeId", "chave");

-- CreateIndex
CREATE INDEX "vinculos_destinoId_idx" ON "vinculos"("destinoId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculos_origemId_destinoId_rotulo_key" ON "vinculos"("origemId", "destinoId", "rotulo");

-- CreateIndex
CREATE INDEX "personagens_campanhaId_idx" ON "personagens"("campanhaId");

-- CreateIndex
CREATE INDEX "personagens_donoId_idx" ON "personagens"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_campanhaId_numero_key" ON "sessoes"("campanhaId", "numero");

-- AddForeignKey
ALTER TABLE "universos" ADD CONSTRAINT "universos_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_universoId_fkey" FOREIGN KEY ("universoId") REFERENCES "universos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_sistemaId_fkey" FOREIGN KEY ("sistemaId") REFERENCES "sistemas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades" ADD CONSTRAINT "entidades_universoId_fkey" FOREIGN KEY ("universoId") REFERENCES "universos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades" ADD CONSTRAINT "entidades_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campos_entidade" ADD CONSTRAINT "campos_entidade_entidadeId_fkey" FOREIGN KEY ("entidadeId") REFERENCES "entidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "entidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "entidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personagens" ADD CONSTRAINT "personagens_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personagens" ADD CONSTRAINT "personagens_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personagens" ADD CONSTRAINT "personagens_entidadeId_fkey" FOREIGN KEY ("entidadeId") REFERENCES "entidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
