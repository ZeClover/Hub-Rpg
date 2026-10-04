import type { ResumoPersonagem } from "@/lib/sistemas/resumo-personagem";

export function ResumoFicha({ resumo }: { resumo: ResumoPersonagem }) {
  return (
    <div className="hub-resumo">
      {(resumo.progressao || resumo.identidade.length > 0) && (
        <p className="hub-card-meta">
          {[resumo.progressao, ...resumo.identidade]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {resumo.vida && (
        <div className="mt-3">
          <div className="hub-life-label">
            <span>{resumo.vida.rotulo}</span>
            <span>
              {resumo.vida.atual} / {resumo.vida.maxima}
            </span>
          </div>
          <div
            className="hub-life-track"
            role="meter"
            aria-label={resumo.vida.rotulo}
            aria-valuemin={0}
            aria-valuemax={resumo.vida.maxima}
            aria-valuenow={Math.min(
              resumo.vida.maxima,
              Math.max(0, resumo.vida.atual),
            )}
          >
            <span
              style={{
                width: `${Math.min(100, Math.max(0, (resumo.vida.atual / resumo.vida.maxima) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
