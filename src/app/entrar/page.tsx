import { redirect } from "next/navigation";
import { BotaoGoogle } from "./botao-google";
import { usuarioAtual } from "@/lib/usuario";

const mensagensDeErro: Record<string, string> = {
  recusado: "Você cancelou a entrada na tela do Google.",
  "sem-codigo": "O Google não devolveu a confirmação. Tente de novo.",
  falhou: "Não foi possível concluir a entrada. Tente de novo.",
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  // Quem já está logado não tem o que fazer na tela de login.
  if (await usuarioAtual()) redirect("/painel");

  const { erro } = await searchParams;
  const mensagem = erro
    ? (mensagensDeErro[erro] ?? "Algo deu errado na entrada.")
    : null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
        Hub RPG
      </p>
      <h1 className="mt-4 font-titulo text-3xl">Entrar</h1>
      <p className="mt-3 text-sm leading-relaxed text-texto-suave">
        O Hub usa sua conta Google. Não criamos senha e não guardamos nenhuma —
        pedimos só seu nome, email e foto.
      </p>

      {mensagem && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-segredo/50 bg-segredo/10 px-4 py-3 text-sm text-texto"
        >
          {mensagem}
        </p>
      )}

      <BotaoGoogle />
    </main>
  );
}
