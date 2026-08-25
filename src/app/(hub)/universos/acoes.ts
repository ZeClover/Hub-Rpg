"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { banco } from "@/lib/banco";
import { slugUnico } from "@/lib/slug-unico";
import { usuarioAtual } from "@/lib/usuario";

export type ResultadoDoFormulario = { erro?: string };

const LIMITE_NOME = 80;
const LIMITE_DESCRICAO = 2000;

/*
  Cria um universo.

  Isto é uma "Server Action": a função vive no servidor, mas o formulário
  chama ela direto, sem a gente escrever a ligação no meio. O importante é que
  nada aqui confia no que veio do navegador — nem o nome, nem quem é o dono.
*/
export async function criarUniverso(
  _anterior: ResultadoDoFormulario,
  dados: FormData,
): Promise<ResultadoDoFormulario> {
  const usuario = await usuarioAtual();
  // A Server Action é um endereço público: alguém pode chamá-la por fora da
  // tela. Por isso ela confere o login de novo, mesmo o layout já tendo feito.
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const nome = String(dados.get("nome") ?? "").trim();
  const descricao = String(dados.get("descricao") ?? "").trim();

  if (!nome) return { erro: "Dê um nome ao universo." };
  if (nome.length > LIMITE_NOME) {
    return { erro: `O nome passa de ${LIMITE_NOME} caracteres.` };
  }
  if (descricao.length > LIMITE_DESCRICAO) {
    return { erro: `A descrição passa de ${LIMITE_DESCRICAO} caracteres.` };
  }

  const slug = await slugUnico(nome, async (candidato) => {
    const achado = await banco.universo.findUnique({
      where: { slug: candidato },
      select: { id: true },
    });
    return achado !== null;
  });

  await banco.universo.create({
    data: {
      nome,
      slug,
      descricao: descricao || null,
      donoId: usuario.id,
    },
  });

  revalidatePath("/universos");
  revalidatePath("/painel");
  redirect(`/universos/${slug}`);
}
