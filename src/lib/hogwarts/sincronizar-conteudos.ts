import { banco } from "@/lib/banco";
import { CONTEUDOS_HOGWARTS_1_ANO } from "@/lib/hogwarts/conteudos-primeiro-ano";

/** Upsert idempotente: normaliza a base, sem tocar em override de campanha. */
export async function sincronizarConteudosHogwartsPrimeiroAno() {
  const sistema = await banco.sistema.findUnique({ where: { chave: "hogwarts-rpg" }, select: { id: true } });
  if (!sistema) throw new Error("Sistema Hogwarts RPG não cadastrado");

  await banco.$transaction(async (tx) => {
    for (const c of CONTEUDOS_HOGWARTS_1_ANO) {
      const conteudo = await tx.conteudoSistema.upsert({
        where: { sistemaId_slug: { sistemaId: sistema.id, slug: c.slug } },
        create: {
          sistemaId: sistema.id, slug: c.slug, nome: c.nome, categoria: c.categoria,
          pericia: c.pericia, atributoPadrao: c.atributo_padrao, requisitoPericia: c.requisito_pericia,
          custo: c.custo, anoNormal: c.ano_normal, descricao: c.descricao, efeito: c.efeito,
          tags: [...c.tags], fonte: c.fonte, restrito: c.restrito, secreto: c.secreto,
        },
        update: {
          nome: c.nome, categoria: c.categoria, pericia: c.pericia, atributoPadrao: c.atributo_padrao,
          requisitoPericia: c.requisito_pericia, custo: c.custo, anoNormal: c.ano_normal,
          descricao: c.descricao, efeito: c.efeito, tags: [...c.tags], fonte: c.fonte,
          restrito: c.restrito, secreto: c.secreto,
        },
      });
      const detalhe = {
        faseCurricular: c.fase_curricular,
        permitidoCriacao: c.permitido_criacao,
        acao: c.mecanica?.acao ?? null,
        alcance: c.mecanica?.alcance ?? null,
        area: c.mecanica?.area ?? null,
        duracao: c.mecanica?.duracao ?? null,
        concentracao: c.mecanica?.concentracao ?? null,
        dano: c.mecanica?.dano ?? null,
        natureza: c.mecanica?.natureza ?? null,
        sucesso: c.mecanica?.sucesso ?? null,
        elevado: c.mecanica?.elevado ?? null,
        excepcional: c.mecanica?.excepcional ?? null,
        termino: c.mecanica?.termino ?? null,
      };
      await tx.hogwartsConteudoDetalhe.upsert({
        where: { conteudoId: conteudo.id },
        create: { conteudoId: conteudo.id, ...detalhe },
        update: detalhe,
      });
    }
  });
  return sistema.id;
}
