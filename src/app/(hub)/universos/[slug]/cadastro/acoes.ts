"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { banco } from "@/lib/banco";
import { slugUnico } from "@/lib/slug-unico";
import { ehTipoValido } from "@/lib/tipos-entidade";
import { usuarioAtual } from "@/lib/usuario";

export type Resultado = { erro?: string };

const LIMITE_NOME = 120;
const LIMITE_RESUMO = 300;
const LIMITE_CORPO = 20000;
const LIMITE_CHAVE = 60;
const LIMITE_VALOR = 2000;

/*
  Confere que o universo existe E é de quem está pedindo, numa consulta só.

  Toda ação do cadastro começa por aqui. Se a pessoa não for a dona, a função
  devolve `null` e a ação para — em vez de a ação confiar no id que veio do
  formulário, que é coisa que o navegador pode forjar.
*/
async function universoDoUsuario(slug: string) {
  const usuario = await usuarioAtual();
  if (!usuario) return null;

  const universo = await banco.universo.findFirst({
    where: { slug, donoId: usuario.id },
    select: { id: true, slug: true },
  });
  if (!universo) return null;

  return { universo, usuario };
}

export async function criarEntidade(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const slugUniverso = String(dados.get("universo") ?? "");
  const contexto = await universoDoUsuario(slugUniverso);
  if (!contexto) return { erro: "Universo não encontrado ou sem permissão." };

  const nome = String(dados.get("nome") ?? "").trim();
  const tipo = String(dados.get("tipo") ?? "");
  const resumo = String(dados.get("resumo") ?? "").trim();
  const corpo = String(dados.get("corpo") ?? "").trim();

  if (!nome) return { erro: "Dê um nome." };
  if (nome.length > LIMITE_NOME) return { erro: "O nome está longo demais." };
  if (!ehTipoValido(tipo)) return { erro: "Escolha um tipo." };
  if (resumo.length > LIMITE_RESUMO) return { erro: "O resumo está longo demais." };
  if (corpo.length > LIMITE_CORPO) return { erro: "O texto está longo demais." };

  const slug = await slugUnico(nome, async (candidato) => {
    const achado = await banco.entidade.findFirst({
      where: { universoId: contexto.universo.id, slug: candidato },
      select: { id: true },
    });
    return achado !== null;
  });

  await banco.entidade.create({
    data: {
      universoId: contexto.universo.id,
      tipo,
      nome,
      slug,
      resumo: resumo || null,
      corpo: corpo || null,
      criadoPorId: contexto.usuario.id,
    },
  });

  revalidatePath(`/universos/${slugUniverso}/cadastro`);
  revalidatePath(`/universos/${slugUniverso}`);
  redirect(`/universos/${slugUniverso}/cadastro/${slug}`);
}

export async function adicionarCampo(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const slugUniverso = String(dados.get("universo") ?? "");
  const slugEntidade = String(dados.get("entidade") ?? "");
  const contexto = await universoDoUsuario(slugUniverso);
  if (!contexto) return { erro: "Universo não encontrado ou sem permissão." };

  const chave = String(dados.get("chave") ?? "").trim();
  const valor = String(dados.get("valor") ?? "").trim();
  const segredo = dados.get("segredo") === "on";

  if (!chave) return { erro: "Dê um nome ao campo." };
  if (chave.length > LIMITE_CHAVE) return { erro: "O nome do campo está longo demais." };
  if (!valor) return { erro: "Preencha o conteúdo do campo." };
  if (valor.length > LIMITE_VALOR) return { erro: "O conteúdo está longo demais." };

  // A entidade precisa pertencer a este universo — não basta o id bater.
  const entidade = await banco.entidade.findFirst({
    where: { slug: slugEntidade, universoId: contexto.universo.id },
    select: { id: true },
  });
  if (!entidade) return { erro: "Ficha não encontrada." };

  const ultimo = await banco.campoEntidade.findFirst({
    where: { entidadeId: entidade.id },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  await banco.campoEntidade.create({
    data: {
      entidadeId: entidade.id,
      chave,
      valor,
      visibilidade: segredo ? "MESTRE" : "PUBLICO",
      ordem: (ultimo?.ordem ?? 0) + 1,
    },
  });

  revalidatePath(`/universos/${slugUniverso}/cadastro/${slugEntidade}`);
  return {};
}

export async function removerCampo(dados: FormData): Promise<void> {
  const slugUniverso = String(dados.get("universo") ?? "");
  const slugEntidade = String(dados.get("entidade") ?? "");
  const campoId = String(dados.get("campoId") ?? "");

  const contexto = await universoDoUsuario(slugUniverso);
  if (!contexto) return;

  /*
    A exclusão amarra o campo ao universo de quem pediu. Sem essa amarração,
    bastaria alguém mandar o id de um campo de outra pessoa para apagá-lo.
  */
  await banco.campoEntidade.deleteMany({
    where: {
      id: campoId,
      entidade: { slug: slugEntidade, universoId: contexto.universo.id },
    },
  });

  revalidatePath(`/universos/${slugUniverso}/cadastro/${slugEntidade}`);
}

export async function editarEntidade(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const slugUniverso = String(dados.get("universo") ?? "");
  const slugEntidade = String(dados.get("entidade") ?? "");
  const contexto = await universoDoUsuario(slugUniverso);
  if (!contexto) return { erro: "Universo não encontrado ou sem permissão." };

  const nome = String(dados.get("nome") ?? "").trim();
  const tipo = String(dados.get("tipo") ?? "");
  const resumo = String(dados.get("resumo") ?? "").trim();
  const corpo = String(dados.get("corpo") ?? "").trim();

  if (!nome) return { erro: "Dê um nome." };
  if (nome.length > LIMITE_NOME) return { erro: "O nome está longo demais." };
  if (!ehTipoValido(tipo)) return { erro: "Escolha um tipo." };
  if (resumo.length > LIMITE_RESUMO) return { erro: "O resumo está longo demais." };
  if (corpo.length > LIMITE_CORPO) return { erro: "O texto está longo demais." };

  /*
    O `updateMany` com o universo no filtro é o que amarra a edição ao dono:
    se a ficha for de outra pessoa, nenhuma linha é alterada em vez de a ação
    confiar no slug que veio do formulário.

    O endereço da ficha não muda junto com o nome, de propósito: link que os
    jogadores já salvaram continua funcionando depois de uma correção de
    digitação.
  */
  const alteradas = await banco.entidade.updateMany({
    where: { slug: slugEntidade, universoId: contexto.universo.id },
    data: { tipo, nome, resumo: resumo || null, corpo: corpo || null },
  });

  if (alteradas.count === 0) return { erro: "Ficha não encontrada." };

  revalidatePath(`/universos/${slugUniverso}/cadastro`);
  revalidatePath(`/universos/${slugUniverso}/cadastro/${slugEntidade}`);
  redirect(`/universos/${slugUniverso}/cadastro/${slugEntidade}`);
}

export async function excluirEntidade(dados: FormData): Promise<void> {
  const slugUniverso = String(dados.get("universo") ?? "");
  const slugEntidade = String(dados.get("entidade") ?? "");

  const contexto = await universoDoUsuario(slugUniverso);
  if (!contexto) return;

  // Os campos da ficha somem junto, por conta da regra de cascata do banco.
  await banco.entidade.deleteMany({
    where: { slug: slugEntidade, universoId: contexto.universo.id },
  });

  revalidatePath(`/universos/${slugUniverso}/cadastro`);
  revalidatePath(`/universos/${slugUniverso}`);
  redirect(`/universos/${slugUniverso}/cadastro`);
}
