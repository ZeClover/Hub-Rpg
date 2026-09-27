import { banco } from "@/lib/banco";
import { CONTEUDOS_HOGWARTS_1_ANO } from "@/lib/hogwarts/conteudos-primeiro-ano";

/** Upsert idempotente: normaliza a base, sem tocar em override de campanha. */
export async function sincronizarConteudosHogwartsPrimeiroAno() {
  const sistema = await banco.sistema.findUnique({ where: { chave: "hogwarts-rpg" }, select: { id: true } });
  if (!sistema) throw new Error("Sistema Hogwarts RPG não cadastrado");

  await banco.$transaction(CONTEUDOS_HOGWARTS_1_ANO.map((c) => banco.conteudoSistema.upsert({
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
  })));
  return sistema.id;
}
