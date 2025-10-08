import { FileDown } from "lucide-react";

interface TimelineEntry {
  id: string;
  created_at: string;
  tipo_evento: string;
  valor_solicitado: number | null;
  valor_final: number | null;
  status_evento: string;
  comprovante_url: string | null;
  observacao: string;
}

interface PlanTimelineProps {
  entries: TimelineEntry[];
}

export const PlanTimeline = ({ entries }: PlanTimelineProps) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-sm text-foreground/70">Nenhuma solicitação.</div>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pendente': 'Pendente',
      'aprovado': 'Aprovado',
      'recusado': 'Negado - Fora do ciclo',
      'efetuado': 'Efetuado',
      'negado': 'Negado - Sem saldo'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="text-sm text-foreground space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2">
          <span className="font-medium shrink-0">
            {new Date(entry.created_at).toLocaleDateString('pt-BR')}
          </span>
          <span className="shrink-0">|</span>
          <div className="flex items-center gap-2 flex-wrap">
            {entry.valor_solicitado && (
              <>
                <span>Valor solicitado: {formatCurrency(entry.valor_solicitado)}</span>
                <span>|</span>
              </>
            )}
            {entry.valor_final && (
              <>
                <span>Valor final: {formatCurrency(entry.valor_final)}</span>
                <span>|</span>
              </>
            )}
            <span>Status: <span className="font-bold">{getStatusLabel(entry.status_evento)}</span></span>
            {entry.comprovante_url && (
              <>
                <span>|</span>
                <span>Comprovante</span>
                <a 
                  href={entry.comprovante_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center hover:opacity-70"
                  title="Ver comprovante"
                >
                  <FileDown className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
