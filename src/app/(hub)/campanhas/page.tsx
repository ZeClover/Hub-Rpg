import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";
import { ROTULOS_PAPEL } from "@/lib/visual";
import { Colecao } from "@/components/hub/colecao";
import { CartaoCampanha } from "@/components/hub/cartao-campanha";
import { Icone } from "@/components/hub/icone";
import { CriarCampanha } from "./criar-campanha";
import { EntrarComCodigo } from "./entrar-com-codigo";

export default async function Campanhas() {
  const usuario = (await usuarioAtual())!;
  const participacoes = await banco.participacao.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { criadoEm: "desc" },
    select: {
      papel: true,
      campanha: {
        select: {
          id: true,
          nome: true,
          capaUrl: true,
          descricao: true,
          tags: true,
          sistema: { select: { chave: true, nome: true } },
          _count: { select: { participacoes: true, personagens: true } },
          sessoes: {
            where: { data: { gte: new Date() } },
            orderBy: { data: "asc" },
            take: 1,
            select: { numero: true, data: true },
          },
        },
      },
    },
  });
  return (
    <main>
      <header className="hub-page-heading">
        <div>
          <p className="hub-eyebrow">Suas mesas, seus mundos</p>
          <h1>Campanhas</h1>
          <p>
            Encontre sua mesa, acompanhe a próxima sessão e reúna seu grupo.
          </p>
        </div>
        <a href="#nova-campanha" className="hub-button hub-button-primary">
          <Icone nome="mais" /> Nova campanha
        </a>
      </header>
      <Colecao
        filtros={["sistema", "papel"]}
        placeholder="Nome, sistema ou tema da campanha…"
        vazio="Crie uma campanha ou entre na mesa dos seus amigos com um código de convite."
        acaoVazia={
          <a href="#nova-campanha" className="hub-button hub-button-primary">
            Criar ou entrar em uma campanha
          </a>
        }
        entradas={participacoes.map(({ campanha: c, papel }) => ({
          id: c.id,
          nome: c.nome,
          sistema: c.sistema.nome,
          papel: ROTULOS_PAPEL[papel],
          busca: [c.descricao, ...c.tags].join(" "),
          conteudo: <CartaoCampanha campanha={c} papel={papel} />,
        }))}
      />
      <section id="nova-campanha" className="mt-8">
        <h2 className="font-titulo text-2xl">Uma nova aventura</h2>
        <div className="hub-creation-grid">
          <CriarCampanha />
          <EntrarComCodigo />
        </div>
      </section>
    </main>
  );
}
