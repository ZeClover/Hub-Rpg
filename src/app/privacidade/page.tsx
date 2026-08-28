/*
  Política de Privacidade — página pública, sem exigir login.

  Existe porque o Google só libera o login pra qualquer conta (em vez de só
  as até 100 contas cadastradas manualmente) se o app tiver uma URL de
  Política de Privacidade preenchida na tela de permissão OAuth. É curta e
  em português comum de propósito: só descreve o que este projeto realmente
  faz com os dados, sem juridiquês.
*/
import Link from "next/link";

export const metadata = {
  title: "Privacidade — Hub RPG",
};

export default function Privacidade() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
        Hub RPG
      </p>
      <h1 className="mt-4 font-titulo text-3xl">Política de Privacidade</h1>
      <p className="mt-3 text-sm text-texto-suave">
        Última atualização: 28 de agosto de 2026.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-texto">
        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            O que é o Hub RPG
          </h2>
          <p className="mt-2 text-texto-suave">
            Um projeto pessoal, sem fins comerciais, onde eu (Zé) e as
            pessoas das minhas mesas de RPG guardamos fichas de personagem.
            Não existe anúncio, não existe venda de dado e não existe
            cobrança nenhuma.
          </p>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            Quais dados eu guardo
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-texto-suave">
            <li>
              <strong className="text-texto">Da sua conta Google:</strong> só
              nome, email e foto de perfil — o mínimo que o Google entrega
              num login. Não peço nenhuma outra permissão, e nunca vejo sua
              senha.
            </li>
            <li>
              <strong className="text-texto">Das suas fichas:</strong> o
              conteúdo que você mesmo digita nelas (atributos, poderes,
              equipamento, e assim por diante).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            Onde isso fica guardado
          </h2>
          <p className="mt-2 text-texto-suave">
            Num banco de dados Supabase, hospedado em São Paulo, e o site
            roda na Vercel. Ninguém além de mim tem acesso a esse banco.
          </p>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            Quem vê o quê
          </h2>
          <p className="mt-2 text-texto-suave">
            Por padrão, uma ficha só aparece pra quem a criou. Existe um
            interruptor opcional, que o dono liga por vontade própria, pra
            gerar um link de leitura — quem tiver esse link consegue ver a
            ficha (sem poder editar), do jeito que funciona um link
            compartilhável do Google Docs. Sem esse interruptor ligado,
            ninguém mais enxerga a ficha.
          </p>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            O que eu não faço
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-texto-suave">
            <li>Não vendo, alugo ou compartilho seus dados com terceiros.</li>
            <li>Não uso os dados pra treinar nenhuma inteligência artificial.</li>
            <li>Não mostro anúncio nem faço rastreamento de navegação.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">
            Apagar sua conta ou seus dados
          </h2>
          <p className="mt-2 text-texto-suave">
            Você pode apagar cada ficha sozinho, pela tela de{" "}
            <span className="text-texto">Fichas</span>. Pra apagar a conta
            inteira (o registro de nome/email/foto), é só me pedir pelo
            contato abaixo.
          </p>
        </section>

        <section>
          <h2 className="font-titulo text-base text-ambar-forte">Contato</h2>
          <p className="mt-2 text-texto-suave">
            Dúvida, pedido de remoção de dados, ou qualquer outra coisa:{" "}
            <a
              href="mailto:paulinogamer002@gmail.com"
              className="text-ambar-forte underline underline-offset-2"
            >
              paulinogamer002@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-16 text-sm text-texto-suave underline underline-offset-2 hover:text-texto"
      >
        ← Voltar
      </Link>
    </main>
  );
}
