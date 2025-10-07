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
    <div className="text-sm text-foreground/70 space-y-1">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">
            {new Date(entry.created_at).toLocaleDateString('pt-BR')}
          </span>
          <span>|</span>
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
          <span>Status: {getStatusLabel(entry.status_evento)}</span>
          {entry.comprovante_url && (
            <>
              <span>|</span>
              <a 
                href={entry.comprovante_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <FileDown className="w-3 h-3" />
                Comprovante
              </a>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
