import Link from 'next/link';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { SISTEMAS } from '@/lib/sistemas';
import { CriarNpc } from '../fichas/criar-npc';

export default async function Bestiario() {
  const usuario = (await usuarioAtual())!;
  const criaturas = await banco.personagem.findMany({
    where: { donoId: usuario.id, ehMonstro: true }, orderBy: { atualizadoEm: 'desc' },
    select: { id: true, nome: true, sistema: { select: { chave: true, nome: true } }, campanha: { select: { nome: true } } },
  });
  return <main>
    <header className="hub-page-heading"><div><p className="hub-eyebrow">Biblioteca do mestre</p><h1>Bestiário</h1><p>Seus NPCs e monstros, separados dos personagens jogadores.</p></div><Link href="/fichas">Voltar aos personagens</Link></header>
    <CriarNpc />
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Suas criaturas">
      {criaturas.map(c => { const sistema = SISTEMAS.find(s => s.chave === c.sistema.chave); return <article key={c.id} className="rounded-lg border border-borda bg-superficie p-5"><h2 className="text-lg">{c.nome}</h2><p className="text-sm text-suave">{c.sistema.nome} · {c.campanha?.nome ?? 'Modelo avulso'}</p><Link className="mt-3 inline-block text-ambar-forte" href={sistema?.fichaInimigo ? `${sistema.fichaInimigo}?id=${c.id}` : `/fichas/${c.id}`}>Abrir criatura →</Link></article>; })}
      {!criaturas.length && <p>Crie seu primeiro NPC ou monstro acima.</p>}
    </section>
  </main>;
}
