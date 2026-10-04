import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";
import { visualSistema } from "@/lib/visual";
import { Colecao } from "@/components/hub/colecao";
import { VitrineSistemas } from "@/components/hub/vitrine-sistemas";
import { CartaoSistema } from "@/components/hub/cartao-sistema";

export default async function Sistemas() {
  const usuario = (await usuarioAtual())!;
  const dados = await banco.usuario.findUnique({
    where: { id: usuario.id },
    select: { sistemasFavoritos: true },
  });
  const favoritos = new Set(dados?.sistemasFavoritos ?? []);
  const sistemas = [...SISTEMAS].sort(
    (a, b) => Number(favoritos.has(b.chave)) - Number(favoritos.has(a.chave)),
  );
  return (
    <main>
      <header className="hub-page-heading">
        <div>
          <p className="hub-eyebrow">Encontre sua próxima aventura</p>
          <h1>Sistemas</h1>
          <p>
            Oito mundos para explorar. Conheça as fichas, encontre referências e
            escolha por onde começar.
          </p>
        </div>
      </header>
      <VitrineSistemas sistemas={SISTEMAS} />
      <h2 className="mt-10 mb-5 font-titulo text-xl">Todos os sistemas</h2>
      <Colecao
        classe="hub-grid-sistemas"
        rotuloOrdem="Ordem do catálogo"
        placeholder="Busque por nome ou tema…"
        entradas={sistemas.map((s) => ({
          id: s.chave,
          nome: s.nome,
          busca: `${s.descricao} ${visualSistema(s.chave).tema}`,
          favorito: favoritos.has(s.chave),
          conteudo: (
            <CartaoSistema sistema={s} favorito={favoritos.has(s.chave)} />
          ),
        }))}
      />
    </main>
  );
}
