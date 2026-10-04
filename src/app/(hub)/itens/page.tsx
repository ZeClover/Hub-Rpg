import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

import { GerenciadorItens, type LocalItem } from "../itens-compartilhados";

/*
  Biblioteca pessoal de itens (decisão #147, ideia #63) e transferência de
  itens entre fichas (ideia #61) — tudo num lugar só, porque as duas ideias
  são a mesma tela vista de ângulos diferentes: "onde estão meus itens
  agora" e "mandar um item daqui pra lá". Nunca toca no `dados` de nenhuma
  ficha (decisão #17) — é um inventário só do Hub, à parte do que cada
  sistema já guarda dentro da própria ficha.
*/
export default async function Itens() {
  const usuario = (await usuarioAtual())!;

  const [itensBiblioteca, personagens] = await Promise.all([
    banco.item.findMany({
      where: { donoId: usuario.id },
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true, descricao: true, quantidade: true },
    }),
    banco.personagem.findMany({
      where: { donoId: usuario.id },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        itens: {
          orderBy: { criadoEm: "desc" },
          select: { id: true, nome: true, descricao: true, quantidade: true },
        },
      },
    }),
  ]);

  const destinosParaFicha = (fichaId: string): { rotulo: string; local: LocalItem }[] => [
    { rotulo: "Biblioteca pessoal", local: { donoId: usuario.id } },
    ...personagens
      .filter((p) => p.id !== fichaId)
      .map((p) => ({ rotulo: p.nome, local: { personagemId: p.id } })),
  ];

  const destinosDaBiblioteca: { rotulo: string; local: LocalItem }[] = personagens.map((p) => ({
    rotulo: p.nome,
    local: { personagemId: p.id },
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <header className="hub-page-heading"><div><p className="hub-eyebrow">Equipamento para a próxima aventura</p><h1>Itens</h1><p>Organize sua biblioteca e os inventários dos personagens. Mova itens entre eles escolhendo o destino.</p></div></header>
      <div className="mt-8">
        <GerenciadorItens
          titulo="Biblioteca pessoal"
          itens={itensBiblioteca}
          criarLocal={{ donoId: usuario.id }}
          destinos={destinosDaBiblioteca}
          podeGerenciar
        />
      </div>

      {personagens.length > 0 && (
        <div className="mt-6 space-y-4">
          {personagens.map((personagem) => (
            <GerenciadorItens
              key={personagem.id}
              titulo={personagem.nome}
              itens={personagem.itens}
              criarLocal={{ personagemId: personagem.id }}
              destinos={destinosParaFicha(personagem.id)}
              podeGerenciar
            />
          ))}
        </div>
      )}
    </main>
  );
}
