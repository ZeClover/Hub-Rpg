import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { podeAcessarPersonagem } from "@/lib/dono-personagem";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Uma ficha específica: ler, salvar e apagar.

  Ler e salvar (PATCH) usam a mesma checagem, `campanhasComoMestreDe` +
  `podeAcessarPersonagem` (decisão #131: mestre da campanha pode editar a
  ficha do jogador, não só ler). Apagar é mais estrito — só o dono, nunca o
  mestre (`buscarSeFoiDono`) — perder a ficha de vez não é uma decisão que a
  mesa deveria poder tomar pelo jogador.
*/
async function campanhasComoMestreDe(idDoUsuario: string) {
  return (
    await banco.participacao.findMany({
      where: { usuarioId: idDoUsuario, papel: "MESTRE" },
      select: { campanhaId: true },
    })
  ).map((c) => c.campanhaId);
}

async function buscarSeFoiDono(id: string, idDoUsuario: string) {
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem || personagem.donoId !== idDoUsuario) return null;
  return personagem;
}

/*
  Buscar com direito de editar: dono sempre, ou mestre da campanha à qual a
  ficha está ligada (decisão #131). A lista de campanhas-como-mestre só é
  buscada quando quem pergunta não é a própria dona — a escrita mais comum
  (dono editando a própria ficha) não paga essa consulta extra.
*/
async function buscarSeFoiDonoOuMestre(id: string, idDoUsuario: string) {
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem) return null;
  const ehDono = personagem.donoId === idDoUsuario;
  const campanhasComoMestre = ehDono ? [] : await campanhasComoMestreDe(idDoUsuario);
  if (!podeAcessarPersonagem(idDoUsuario, personagem, campanhasComoMestre)) return null;
  return personagem;
}

/*
  Ler não exige ser o dono, por dois motivos possíveis:

  1. A ficha está com "compartilhado" ligado — quem tem o link entra em modo
     leitura, com ou sem conta (o id, um UUID, é o segredo do link, igual
     "qualquer um com o link" do Google Docs).
  2. Quem pergunta é o mestre da campanha à qual esta ficha está ligada —
     por isso busca as campanhas onde a pessoa é mestre só quando ela não é
     a dona: a leitura mais comum (dono abrindo a própria ficha) não paga
     essa consulta extra.

  Fora esses dois casos, vale a regra de sempre: só o dono, e 404 tanto pra
  "não existe" quanto pra "não é seu nem compartilhada nem sua campanha",
  pra não vazar que a ficha de outra pessoa existe.
*/
export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  // `ehDono` é sempre estrito (só a própria dona) — controla ações que
  // continuam exclusivas do dono na tela (compartilhar, importar JSON).
  // `podeEditar` é o que decide se a ficha abre editável ou só de leitura
  // (decisão #131: dono OU mestre da campanha, os dois editam).
  const usuario = await usuarioAtual();
  const ehDono = usuario ? personagem.donoId === usuario.id : false;

  const campanhasComoMestre =
    usuario && !ehDono && personagem.campanhaId
      ? await campanhasComoMestreDe(usuario.id)
      : [];

  const podeLer = usuario
    ? podeAcessarPersonagem(usuario.id, personagem, campanhasComoMestre)
    : false;

  if (!podeLer && !personagem.compartilhado) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    personagem: {
      id: personagem.id,
      nome: personagem.nome,
      dados: personagem.dados,
      compartilhado: personagem.compartilhado,
      ehDono,
      podeEditar: podeLer,
    },
  });
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDonoOuMestre(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const temDados = corpo && typeof corpo.dados === "object" && corpo.dados !== null;
  // Compartilhar é do dono — o mestre edita a ficha, mas não decide se o
  // link de leitura dela fica público. Um PATCH de mestre com só esse campo
  // (a tela dele nem mostra esse controle) cai no 400 de "nada pra
  // atualizar" logo abaixo, em vez de mudar o compartilhamento em silêncio.
  const ehDono = existente.donoId === usuario.id;
  const temCompartilhado = ehDono && corpo && typeof corpo.compartilhado === "boolean";
  // Status/avatar/banner são organizacionais (decisão #134) — não fazem
  // parte da ficha em si, então seguem a mesma permissão de `dados`: dono
  // ou mestre da campanha, os dois já editam a ficha inteira.
  const STATUS_VALIDOS = ["ATIVO", "RESERVA", "APOSENTADO", "MORTO", "ARQUIVADO"];
  const temStatus = typeof corpo?.status === "string" && STATUS_VALIDOS.includes(corpo.status);
  const temAvatar = typeof corpo?.avatarUrl === "string" || corpo?.avatarUrl === null;
  const temBanner = typeof corpo?.bannerUrl === "string" || corpo?.bannerUrl === null;
  if (!temDados && !temCompartilhado && !temStatus && !temAvatar && !temBanner) {
    return NextResponse.json(
      { erro: "dados, compartilhado, status, avatarUrl ou bannerUrl é obrigatório" },
      { status: 400 },
    );
  }

  // O nome da ficha segue o que a pessoa digitou dentro dela — não precisa
  // de um campo de nome separado em nenhuma tela do Hub. A maioria das
  // fichas de jogador guarda o nome em `perfil.nome`; ficha de inimigo/NPC
  // (sem "perfil", só um `nome` solto — Fabula Ultima e Sistema SAO) cai
  // no `??` de baixo.
  const nomeDentroDaFicha = temDados ? (corpo.dados?.perfil?.nome ?? corpo.dados?.nome) : null;
  const nome =
    typeof nomeDentroDaFicha === "string" && nomeDentroDaFicha.trim()
      ? nomeDentroDaFicha.trim()
      : existente.nome;

  const personagem = await banco.personagem.update({
    where: { id },
    data: {
      ...(temDados ? { dados: corpo.dados, nome } : {}),
      ...(temCompartilhado ? { compartilhado: corpo.compartilhado } : {}),
      ...(temStatus ? { status: corpo.status } : {}),
      ...(temAvatar ? { avatarUrl: corpo.avatarUrl } : {}),
      ...(temBanner ? { bannerUrl: corpo.bannerUrl } : {}),
    },
    select: {
      id: true,
      nome: true,
      compartilhado: true,
      status: true,
      avatarUrl: true,
      bannerUrl: true,
      atualizadoEm: true,
    },
  });

  return NextResponse.json({ personagem });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDono(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.personagem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
