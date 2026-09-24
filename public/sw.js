// Service worker do PWA (decisão #150, ideias #128/#129) — cacheia sozinho
// só o que a pessoa já visitou (telas do Hub, fichas de sistema, o retrato
// json de uma ficha), pra essas telas recentes abrirem mesmo sem internet.
// Nunca cacheia POST/PATCH/DELETE — só leitura pode vir do cache.
//
// Custo zero (decisão #5): Cache API é nativa do navegador, sem serviço
// nenhum por trás.

const CACHE_ESTATICO = "hub-rpg-estatico-v1";
const CACHE_NAVEGACAO = "hub-rpg-paginas-v1";
const CACHE_API = "hub-rpg-api-v1";
const CACHES_ATUAIS = [CACHE_ESTATICO, CACHE_NAVEGACAO, CACHE_API];

// Só isto é pré-cacheado na instalação — nada que exija login, pra não
// falhar a instalação do service worker em nome de gente ainda não
// autenticada. `/offline` é a página mostrada quando não há rede nem
// versão em cache de uma navegação.
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    Promise.all([
      caches.open(CACHE_NAVEGACAO).then((cache) => cache.add("/offline")),
      caches
        .open(CACHE_ESTATICO)
        .then((cache) => cache.addAll(["/manifest.json", "/icone-192.png", "/icone-512.png"])),
    ]),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => !CACHES_ATUAIS.includes(nome))
          .map((nome) => caches.delete(nome)),
      ),
    ),
  );
  self.clients.claim();
});

/// Recursos com hash no nome (o Next marca `_next/static` como imutável),
/// mais o manifesto e os ícones do PWA — cache-first: raramente mudam, não
/// precisa perguntar de novo pra rede toda vez.
function ehEstaticoImutavel(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/icone-")
  );
}

async function cacheFirst(requisicao, nomeCache) {
  const cache = await caches.open(nomeCache);
  const emCache = await cache.match(requisicao);
  if (emCache) return emCache;
  const daRede = await fetch(requisicao);
  if (daRede.ok) cache.put(requisicao, daRede.clone());
  return daRede;
}

/// Navegação de página e leitura de API — tenta a rede primeiro (dado
/// fresco sempre que dá); se a rede falhar (offline), cai pro que já foi
/// visitado. Escreve no cache só respostas de sucesso.
async function networkFirst(requisicao, nomeCache) {
  const cache = await caches.open(nomeCache);
  try {
    const daRede = await fetch(requisicao);
    if (daRede.ok) cache.put(requisicao, daRede.clone());
    return daRede;
  } catch {
    const emCache = await cache.match(requisicao);
    if (emCache) return emCache;
    throw new Error("sem rede e sem cache");
  }
}

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return; // nunca intercepta escrita
  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return;

  if (ehEstaticoImutavel(url)) {
    evento.respondWith(cacheFirst(requisicao, CACHE_ESTATICO));
    return;
  }

  if (requisicao.mode === "navigate") {
    evento.respondWith(
      networkFirst(requisicao, CACHE_NAVEGACAO).catch(
        () => caches.match("/offline") ?? Response.error(),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    evento.respondWith(networkFirst(requisicao, CACHE_API));
    return;
  }
});
