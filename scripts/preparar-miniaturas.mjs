// As miniaturas são arquivos estáticos; nenhuma transformação roda em produção.
// Execute depois de trocar uma imagem da biblioteca: npm run imagens.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
const raiz = join(process.cwd(), 'public/imagens');
const destino = join(raiz, 'miniaturas');
await mkdir(destino, { recursive: true });
const catalogo = {};
const atuais = new Set();
for (const pasta of ['retratos', 'sistemas', 'capas']) {
  for (const nome of (await readdir(join(raiz, pasta))).filter(n => n.endsWith('.webp')).sort()) {
    const fonte = await readFile(join(raiz, pasta, nome));
    const versoes = {};
    for (const largura of [160, 320, 640]) {
      const dados = await sharp(fonte).resize({ width: largura, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      const hash = createHash('sha256').update(dados).digest('hex').slice(0, 12);
      const arquivo = `${nome.slice(0,-5)}-${largura}-${hash}.webp`;
      await writeFile(join(destino, arquivo), dados);
      atuais.add(arquivo);
      versoes[largura] = `/imagens/miniaturas/${arquivo}`;
    }
    catalogo[`/imagens/${pasta}/${nome}`] = versoes;
  }
}
// Remove somente arquivos gerados por este script, sem tocar os originais.
for (const arquivo of await readdir(destino)) {
  if (/^.+-(160|320|640)-[a-f0-9]{12}\.webp$/.test(arquivo) && !atuais.has(arquivo)) {
    await unlink(join(destino, arquivo));
  }
}
await writeFile('src/lib/miniaturas-imagens.ts',
  '// Gerado por npm run imagens; os arquivos originais permanecem intactos.\n' +
  'export const MINIATURAS: Record<string, Record<number, string>> = ' + JSON.stringify(catalogo, null, 2) + ';\n');
console.log(`${Object.keys(catalogo).length} imagens com ${atuais.size} miniaturas locais.`);
