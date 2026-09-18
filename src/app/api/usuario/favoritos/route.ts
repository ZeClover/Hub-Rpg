import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

/*
  Favoritar/desfavoritar um sistema (decisão #134) — preferência pessoal,
  guardada na conta (não no navegador) pra acompanhar em qualquer aparelho.

  `chave` precisa ser um sistema que realmente existe em `SISTEMAS`; sem essa
  checagem, um valor qualquer ficaria preso em `sistemasFavoritos` pra sempre,
  sem nunca aparecer em lugar nenhum pra ninguém tirar.
*/
export async function PATCH(requisicao: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const chave = corpo?.chave;
  const favorito = corpo?.favorito;
  if (typeof chave !== "string" || typeof favorito !== "boolean") {
    return NextResponse.json(
      { erro: "chave e favorito são obrigatórios" },
      { status: 400 },
    );
  }
  if (!SISTEMAS.some((s) => s.chave === chave)) {
    return NextResponse.json({ erro: "sistema desconhecido" }, { status: 400 });
  }

  const atual = await banco.usuario.findUnique({
    where: { id: usuario.id },
    select: { sistemasFavoritos: true },
  });
  const favoritosAtuais = atual?.sistemasFavoritos ?? [];
  const novosFavoritos = favorito
    ? favoritosAtuais.includes(chave)
      ? favoritosAtuais
      : [...favoritosAtuais, chave]
    : favoritosAtuais.filter((f) => f !== chave);

  await banco.usuario.update({
    where: { id: usuario.id },
    data: { sistemasFavoritos: novosFavoritos },
  });

  return NextResponse.json({ sistemasFavoritos: novosFavoritos });
}
