import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Solicitacao {
  id: string;
  tipo_solicitacao: string;
  status: string;
  descricao: string | null;
  created_at: string;
  user_id: string;
  plano_adquirido_id: string | null;
  profiles: {
    nome: string;
    email: string;
  };
}

export const SolicitacoesTab = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`
          *,
          profiles!solicitacoes_user_id_fkey(nome, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSolicitacoes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar solicitações: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (items: Solicitacao[]) => {
    const filtered = filter === "all" 
      ? items 
      : items.filter((s) => s.tipo_solicitacao === filter);

    const grouped: Record<string, Solicitacao[]> = {};
    
    filtered.forEach((item) => {
      const date = format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return grouped;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; label: string }> = {
      pendente: { className: "bg-orange-500 text-white", label: "Pendente" },
      atendida: { className: "bg-green-500 text-white", label: "Atendida" },
      rejeitada: { className: "bg-red-500 text-white", label: "Rejeitada" },
    };

    const config = statusMap[status] || statusMap.pendente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      mudanca_saque: "Mudança de Saque",
      segunda_chance: "Segunda Chance no Teste",
      aprovacao_teste: "Aprovação no Teste",
      saque: "Solicitação de Saque",
    };
    return tipoMap[tipo] || tipo;
  };

  const groupedData = groupByDate(solicitacoes);

  if (loading) {
    return <div className="p-8">Carregando solicitações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Lista de Solicitações</h2>
        
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="mudanca_saque">Mudança de Saque</TabsTrigger>
            <TabsTrigger value="segunda_chance">Segunda Chance</TabsTrigger>
            <TabsTrigger value="aprovacao_teste">Aprovação Teste</TabsTrigger>
            <TabsTrigger value="saque">Saque</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedData).length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          Object.entries(groupedData).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">{date}</h3>
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Trader</th>
                      <th className="text-left p-4 text-sm font-medium">Tipo</th>
                      <th className="text-left p-4 text-sm font-medium">Descrição</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-left p-4 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{item.profiles?.nome}</div>
                            <div className="text-sm text-muted-foreground">{item.profiles?.email}</div>
                          </div>
                        </td>
                        <td className="p-4">{getTipoLabel(item.tipo_solicitacao)}</td>
                        <td className="p-4 text-sm">{item.descricao || "-"}</td>
                        <td className="p-4">{getStatusBadge(item.status)}</td>
                        <td className="p-4">
                          <Button size="sm" variant="outline">
                            Visualizar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
