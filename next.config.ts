import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    O Prisma carrega arquivos que não são código comum (o motor de consultas).
    Sem declarar aqui, o empacotador do Next tenta embrulhar tudo e esses
    arquivos ficam de fora — o site publica, mas quebra na primeira consulta
    ao banco.
  */
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],

  images: {
    /*
      As fotos de perfil vêm dos servidores do Google. O Next.js exige que a
      origem de cada imagem externa seja declarada aqui — é o que impede uma
      página de carregar imagem de qualquer lugar da internet.
    */
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
