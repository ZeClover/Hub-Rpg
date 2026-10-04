// Imagens próprias são WebP comprimidas no navegador, limitadas a ~165 KB.
// Usa os campos existentes para funcionar sem bucket, migração ou custo novo.
export function imagemHubValida(valor: unknown): boolean {
  if (valor === null || valor === "") return true;
  if (typeof valor !== "string" || valor.length > 220_030) return false;
  const url = valor.replace(/#hub-pos=(top|center|bottom)$/, "");
  if (/^\/imagens\/(sistemas|retratos)\/[a-z0-9-]+\.webp$/.test(url))
    return true;
  if (url.startsWith("data:image/webp;base64,")) {
    const conteudo = url.slice(23);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(conteudo) || conteudo.length % 4 !== 0)
      return false;
    const bytes = Buffer.from(conteudo, "base64");
    return (
      bytes.length <= 165_000 &&
      bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP"
    );
  }
  if (url.length > 4096) return false;
  try {
    return ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
