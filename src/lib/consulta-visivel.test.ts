import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { consultarEnquantoVisivel } from "./consulta-visivel.ts";

class DocumentoTeste extends EventTarget {
  hidden = false;
  encerrar?: () => void;
  mostrar(visivel: boolean) {
    this.hidden = !visivel;
    this.dispatchEvent(new Event("visibilitychange"));
  }
}

function preparar(t: TestContext, oculto = false) {
  const anterior = Object.getOwnPropertyDescriptor(globalThis, "document");
  const documento = new DocumentoTeste();
  documento.hidden = oculto;
  Object.defineProperty(globalThis, "document", { value: documento, configurable: true });
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => {
    documento.encerrar?.();
    if (anterior) Object.defineProperty(globalThis, "document", anterior);
    else Reflect.deleteProperty(globalThis, "document");
  });
  return documento;
}

async function concluirPromessas() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test("conexão lenta não acumula leituras e desmontar cancela a leitura pendente", async (t) => {
  const documento = preparar(t);
  const sinais: AbortSignal[] = [];
  let concluir: () => void = () => {};
  const encerrar = consultarEnquantoVisivel((signal) => {
    sinais.push(signal);
    return new Promise<void>((resolve) => { concluir = resolve; });
  }, 6000);
  documento.encerrar = encerrar;
  assert.equal(sinais.length, 1);
  t.mock.timers.tick(60000);
  assert.equal(sinais.length, 1);
  concluir();
  await concluirPromessas();
  t.mock.timers.tick(5999);
  assert.equal(sinais.length, 1);
  t.mock.timers.tick(1);
  assert.equal(sinais.length, 2);
  encerrar();
  assert.equal(sinais[1].aborted, true);
  t.mock.timers.tick(60000);
  assert.equal(sinais.length, 2);
});

test("aba oculta pausa consultas e voltar atualiza sem esperar o intervalo", async (t) => {
  const documento = preparar(t, true);
  const leituras: { sinal: AbortSignal; concluir: () => void }[] = [];
  const encerrar = consultarEnquantoVisivel((sinal) => new Promise<void>((concluir) => {
    leituras.push({ sinal, concluir });
  }), 6000);
  documento.encerrar = encerrar;
  t.mock.timers.tick(60000);
  assert.equal(leituras.length, 0);
  documento.mostrar(true);
  assert.equal(leituras.length, 1);
  documento.mostrar(false);
  assert.equal(leituras[0].sinal.aborted, true);
  t.mock.timers.tick(60000);
  assert.equal(leituras.length, 1);
  documento.mostrar(true);
  assert.equal(leituras.length, 2);
  // Uma resposta antiga que termine depois não pode iniciar outro ciclo.
  leituras[0].concluir();
  await concluirPromessas();
  t.mock.timers.tick(6000);
  assert.equal(leituras.length, 2);
  leituras[1].concluir();
  await concluirPromessas();
  t.mock.timers.tick(6000);
  assert.equal(leituras.length, 3);
});

test("falha temporária permite uma nova leitura e encerrar remove o observador", async (t) => {
  const documento = preparar(t);
  let leituras = 0;
  const encerrar = consultarEnquantoVisivel(async () => {
    leituras++;
    if (leituras === 1) throw new Error("rede indisponível");
  }, 6000);
  documento.encerrar = encerrar;
  await concluirPromessas();
  t.mock.timers.tick(6000);
  assert.equal(leituras, 2);
  encerrar();
  documento.mostrar(false);
  documento.mostrar(true);
  t.mock.timers.tick(60000);
  assert.equal(leituras, 2);
});
