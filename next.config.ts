import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
