import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    O Prisma carrega arquivos que não são código comum (o motor de consultas).
    Sem declarar aqui, o empacotador do Next tenta embrulhar tudo e esses
    arquivos ficam de fora — o site publica, mas quebra na primeira consulta
    ao banco.
  */
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],

  async headers() {
    // Os nomes incluem o conteúdo: uma arte nova ganha outro endereço, então
    // o navegador pode guardar estas versões pequenas sem atrasar atualizações.
    return ["/imagens/miniaturas/:path*", "/fontes/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }));
  },

  images: {
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 320, 384],
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
