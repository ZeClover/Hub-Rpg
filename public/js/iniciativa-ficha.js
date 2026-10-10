/* Declaração compartilhada: o resultado é obtido fora do Hub. */
(() => {
  const section = document.createElement('section');
  section.id = 'hub-iniciativa';
  section.className = 'sem-impressao';
  section.style.cssText = 'box-sizing:border-box;max-width:1120px;margin:16px auto;padding:16px;border:1px solid currentColor;border-radius:12px;color:inherit;background:transparent';
  section.innerHTML = '<details><summary style="cursor:pointer;font-weight:700">Declarar iniciativa na Mesa</summary><p>Informe o resultado final obtido fora do Hub, incluindo os modificadores da sua ficha.</p><form style="display:flex;flex-wrap:wrap;align-items:end;gap:12px"><label>Resultado final<input name="resultado" type="number" step="1" min="-1000" max="1000" required style="display:block;box-sizing:border-box;max-width:100%;min-height:44px"></label><button type="submit" style="min-height:44px">Enviar iniciativa</button></form><p role="status" aria-live="polite"></p></details>';
  const form = section.querySelector('form');
  const input = section.querySelector('input');
  const button = section.querySelector('button');
  button.className = 'btn';
  const status = section.querySelector('[role="status"]');
  let context, sending = false;
  function configure() {
    context = window.hubIniciativaContexto;
    if (!context || context.ehMonstro) { section.remove(); return; }
    if (!section.isConnected) {
      const main = document.querySelector('main');
      if (main) main.before(section); else document.body.prepend(section);
    }
    const allowed = context.ehDono && context.campanhaId;
    input.disabled = button.disabled = !allowed || sending;
    if (!allowed) status.textContent = 'Disponível para sua própria ficha vinculada a uma campanha.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !context?.ehDono || !context.campanhaId) return;
    const resultado = Number(input.value);
    if (!input.value.trim() || !Number.isInteger(resultado) || Math.abs(resultado) > 1000) {
      status.textContent = 'Informe um resultado final inteiro entre -1000 e 1000.'; return;
    }
    if (window.hubIniciativaSalvamentoPendente?.()) {
      status.textContent = 'Aguarde a ficha ser salva antes de enviar a iniciativa.'; return;
    }
    sending = true; button.disabled = true; status.textContent = 'Enviando iniciativa…';
    try {
      const response = await fetch('/api/personagens/' + encodeURIComponent(context.id) + '/iniciativa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resultado }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.erro || 'Não foi possível enviar. Tente novamente.');
      status.textContent = 'Iniciativa enviada: ' + body.declaracao.nome + ' — ' + body.declaracao.resultado;
    } catch (error) { status.textContent = error.message || 'Não foi possível enviar. Tente novamente.'; }
    finally { sending = false; configure(); }
  });
  window.addEventListener('hub-iniciativa-contexto', configure);
  configure();
})();
