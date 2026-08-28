import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/*
  Cria uma campanha. Quem cria já nasce mestre dela — por meio de uma
  `Participacao` com papel MESTRE, não de um campo "dono" na campanha, porque
  o schema já previa mais de um mestre um dia (decisão de arquitetura antiga,
  nunca usada até agora).

  `slug` existe no banco desde a época do cadastro de lore e nunca foi usado
  pra nada nesta fatia — preenchido aqui só com o próprio id, pra satisfazer
  a coluna, sem inventar uma funcionalidade de URL bonita que ninguém pediu.
*/
export async function POST(requisicao: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const sistemaChave = corpo?.sistemaChave;
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  if (typeof sistemaChave !== "string" || !nome) {
    return NextResponse.json(
      { erro: "sistemaChave e nome são obrigatórios" },
      { status: 400 },
    );
  }

  const sistema = await banco.sistema.findUnique({ where: { chave: sistemaChave } });
  if (!sistema) {
    return NextResponse.json({ erro: "sistema desconhecido" }, { status: 404 });
  }

  const id = randomUUID();
  const campanha = await banco.campanha.create({
    data: {
      id,
      slug: id,
      nome,
      sistemaId: sistema.id,
      participacoes: {
        create: { usuarioId: usuario.id, papel: "MESTRE" },
      },
    },
    select: { id: true, nome: true },
  });

  return NextResponse.json({ campanha }, { status: 201 });
}
