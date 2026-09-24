import { GerenciadorItens, type ItemView } from "../../itens-compartilhados";
import { Grupos, type GrupoView } from "./grupos";
import { Veiculos, type VeiculoView } from "./veiculos";

/*
  Aba "Equipes" da campanha (decisão #147) — grupos/equipes (#58), cofre da
  campanha e inventário de cada grupo (#59/#60), e veículos genéricos (#57).
  Tudo organizacional, público pra qualquer participante (igual identidade
  da campanha, decisão #134); só o mestre cria/edita, com uma exceção: o
  inventário de um grupo também pode ser mexido por quem tem uma ficha
  naquele grupo — é o "baú do grupo", não só do mestre.
*/
export function Equipes({
  campanhaId,
  grupos,
  itensCofre,
  veiculos,
  fichasDaCampanha,
  souMestre,
  meusPersonagensIds,
}: {
  campanhaId: string;
  grupos: GrupoView[];
  itensCofre: ItemView[];
  veiculos: VeiculoView[];
  fichasDaCampanha: { id: string; nome: string }[];
  souMestre: boolean;
  meusPersonagensIds: Set<string>;
}) {
  const destinosDoCofre = [
    ...grupos.map((g) => ({ rotulo: `Grupo: ${g.nome}`, local: { grupoId: g.id } })),
    ...fichasDaCampanha.map((f) => ({ rotulo: `Ficha: ${f.nome}`, local: { personagemId: f.id } })),
  ];

  return (
    <>
      <Grupos
        campanhaId={campanhaId}
        grupos={grupos}
        fichasDaCampanha={fichasDaCampanha}
        souMestre={souMestre}
      />

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Cofre da campanha</h2>
        <p className="mt-2 text-sm text-texto-suave">
          Recursos da campanha ainda não distribuídos — separado do
          inventário de cada grupo.
        </p>
        <div className="mt-3">
          <GerenciadorItens
            titulo="Cofre"
            itens={itensCofre}
            criarLocal={{ campanhaId }}
            destinos={destinosDoCofre}
            podeGerenciar={souMestre}
          />
        </div>
      </section>

      {grupos.length > 0 && (
        <section className="mt-8">
          <h2 className="font-titulo text-xl">Inventário dos grupos</h2>
          <div className="mt-3 space-y-4">
            {grupos.map((grupo) => {
              const souMembro = grupo.membros.some((m) => meusPersonagensIds.has(m.personagemId));
              const destinos = [
                { rotulo: "Cofre da campanha", local: { campanhaId } },
                ...grupo.membros.map((m) => ({
                  rotulo: m.nome,
                  local: { personagemId: m.personagemId },
                })),
              ];
              return (
                <GerenciadorItens
                  key={grupo.id}
                  titulo={grupo.nome}
                  itens={grupo.itens}
                  criarLocal={{ grupoId: grupo.id }}
                  destinos={destinos}
                  podeGerenciar={souMestre || souMembro}
                />
              );
            })}
          </div>
        </section>
      )}

      <Veiculos
        campanhaId={campanhaId}
        veiculos={veiculos}
        fichasDaCampanha={fichasDaCampanha}
        souMestre={souMestre}
      />
    </>
  );
}
