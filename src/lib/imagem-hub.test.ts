import { test } from "node:test";
import assert from "node:assert/strict";
import { imagemHubValida } from "./imagem-hub.ts";

test("aceita URLs anteriores, biblioteca e enquadramento persistido", () => {
  for (const url of [
    null,
    "",
    "https://example.com/avatar.jpg",
    "http://example.com/avatar.png",
    "/imagens/retratos/retrato-1.webp#hub-pos=top",
  ])
    assert.ok(imagemHubValida(url));
});
test("recusa esquemas ativos, SVG embutido, caminhos arbitrários e imagens excessivas", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:image/svg+xml,<svg>",
    "//example.com/x",
    "/api/secret",
    "https://a.test/" + "x".repeat(5000),
    "data:image/webp;base64," + "A".repeat(220_000),
  ])
    assert.equal(imagemHubValida(url), false);
});
test("imagem embutida exige formato WebP e tamanho limitado", () => {
  const bytes = Buffer.from("RIFF1234WEBPdata");
  assert.ok(
    imagemHubValida("data:image/webp;base64," + bytes.toString("base64")),
  );
  assert.equal(
    imagemHubValida(
      "data:image/webp;base64," +
        Buffer.from("não é uma imagem").toString("base64"),
    ),
    false,
  );
});
