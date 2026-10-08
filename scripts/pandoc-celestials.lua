-- Limpa elementos exclusivos da tela e pictogramas sem glifo no PDF.
local pictogramas = {
  '🌌', '🧭', '🎲', '📖', '🛡️', '🛡', '✨', '🌟', '⚔️', '⚔', '🔥',
  '👹', '🎒', '🌠', '⭐', '🐲', '❓', '📋', '⏭️', '⏭'
}

function Div(div)
  for _, classe in ipairs(div.classes) do
    if classe == 'barra' or classe == 'top' then return {} end
  end
end

function Str(texto)
  for _, simbolo in ipairs(pictogramas) do texto.text = texto.text:gsub(simbolo, '') end
  return texto
end
