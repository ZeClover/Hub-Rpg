CREATE TABLE IF NOT EXISTS "leituras_eventos_hogwarts" (
  "eventoId" UUID NOT NULL,
  "usuarioId" UUID NOT NULL,
  "lidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leituras_eventos_hogwarts_pkey" PRIMARY KEY ("eventoId", "usuarioId"),
  CONSTRAINT "leituras_eventos_hogwarts_eventoId_fkey" FOREIGN KEY ("eventoId")
    REFERENCES "eventos_auditoria_hogwarts"("id") ON DELETE CASCADE,
  CONSTRAINT "leituras_eventos_hogwarts_usuarioId_fkey" FOREIGN KEY ("usuarioId")
    REFERENCES "usuarios"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "leituras_eventos_hogwarts_usuarioId_lidoEm_idx"
  ON "leituras_eventos_hogwarts"("usuarioId", "lidoEm");
