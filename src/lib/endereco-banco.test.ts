import assert from "node:assert/strict";
import { test } from "node:test";

import { removerSslDoEndereco } from "./endereco-banco.ts";

test("remove sslmode e mantém o resto", () => {
  assert.equal(
    removerSslDoEndereco(
      "postgres://u:s@host:6543/db?sslmode=require&pgbouncer=true",
    ),
    "postgres://u:s@host:6543/db?pgbouncer=true",
  );
});

test("remove o ? quando sslmode era o único parâmetro", () => {
  assert.equal(
    removerSslDoEndereco("postgres://u:s@host:6543/db?sslmode=require"),
    "postgres://u:s@host:6543/db",
  );
});

test("endereço sem parâmetros passa intacto", () => {
  const endereco = "postgres://u:s@host:6543/db";
  assert.equal(removerSslDoEndereco(endereco), endereco);
});

test("não altera usuário e senha, mesmo com caracteres especiais", () => {
  // Uma senha reescrita por engano derruba o acesso ao banco.
  const endereco = "postgres://user:p%40ss%2Fw%3Ard!@host:6543/db?sslmode=require";
  assert.equal(
    removerSslDoEndereco(endereco),
    "postgres://user:p%40ss%2Fw%3Ard!@host:6543/db",
  );
});

test("reconhece o parâmetro em maiúsculas", () => {
  assert.equal(
    removerSslDoEndereco("postgres://h/db?SSLMode=verify-full&a=1"),
    "postgres://h/db?a=1",
  );
});

test("não confunde parâmetro de nome parecido", () => {
  const endereco = "postgres://h/db?sslmode_extra=1&sslrootcert=x";
  assert.equal(removerSslDoEndereco(endereco), endereco);
});
