import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { normalizarLocal, podeGerenciarLocal } from "@/lib/itens";
import { usuarioAtual } from "@/lib/usuario";

/*
  Criar um item genérico do Hub (decisão #147, ideias #59/#60/#61/#63) —
  em qualquer um dos quatro locais possíveis, contanto que quem pede possa
  gerenciar aquele local. Sem GET: cada tela já busca os itens do lugar que
  está olhando (ficha, grupo ou campanha) junto com o resto dos dados dela.
*/
export async function POST(requisicao: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : null;
  const quantidade = Number.isInteger(corpo?.quantidade) && corpo.quantidade > 0 ? corpo.quantidade : 1;
  if (!nome) {
    return NextResponse.json({ erro: "nome é obrigatório" }, { status: 400 });
  }

  const local = normalizarLocal({
    donoId: typeof corpo?.donoId === "string" ? corpo.donoId : null,
    personagemId: typeof corpo?.personagemId === "string" ? corpo.personagemId : null,
    grupoId: typeof corpo?.grupoId === "string" ? corpo.grupoId : null,
    campanhaId: typeof corpo?.campanhaId === "string" ? corpo.campanhaId : null,
  });
  if (!local.donoId && !local.personagemId && !local.grupoId && !local.campanhaId) {
    return NextResponse.json({ erro: "informe onde o item nasce" }, { status: 400 });
  }
  // Item sem dono explícito na biblioteca pessoal: só dá pra criar na
  // própria conta de quem pede.
  if (local.donoId && local.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await podeGerenciarLocal(local, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const item = await banco.item.create({
    data: { nome, descricao, quantidade, ...local },
    select: {
      id: true,
      nome: true,
      descricao: true,
      quantidade: true,
      donoId: true,
      personagemId: true,
      grupoId: true,
      campanhaId: true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
