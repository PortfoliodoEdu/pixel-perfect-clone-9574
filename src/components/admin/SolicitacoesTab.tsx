import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Upload, Search } from "lucide-react";

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
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [valorFinal, setValorFinal] = useState("");
  const [status, setStatus] = useState("pendente");
  const [uploading, setUploading] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    let filtered = filter === "all" 
      ? items 
      : items.filter((s) => s.tipo_solicitacao === filter);

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter((s) => 
        s.profiles?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTipoLabel(s.tipo_solicitacao).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por data
    if (startDate) {
      filtered = filtered.filter((s) => new Date(s.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => new Date(s.created_at) <= end);
    }

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
      aprovado: { className: "bg-blue-500 text-white", label: "Aprovado" },
      efetuado: { className: "bg-emerald-500 text-white", label: "Efetuado" },
      recusado: { className: "bg-gray-500 text-white", label: "Recusado" },
    };

    const config = statusMap[status] || statusMap.pendente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      saque_quinzenal: "Mudança de Saque Quinzenal",
      segunda_chance: "Segunda Chance no Teste",
      outro: "Outras Solicitações",
      saque: "Solicitação de Saque",
    };
    return tipoMap[tipo] || tipo;
  };

  const handleVisualizarClick = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setValorFinal("");
    setStatus("pendente");
    setComprovanteUrl("");
    setDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `comprovantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      setComprovanteUrl(publicUrl);
      toast.success("Comprovante enviado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao enviar comprovante: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSolicitacao = async () => {
    if (!selectedSolicitacao) return;

    try {
      setUpdating(true);

      // Atualizar a solicitação
      const { error: solicitacaoError } = await supabase
        .from('solicitacoes')
        .update({
          status: status,
          resposta_admin: valorFinal ? `Valor final: R$ ${valorFinal}` : null
        })
        .eq('id', selectedSolicitacao.id);

      if (solicitacaoError) throw solicitacaoError;

      // Atualizar o histórico relacionado
      const { data: historicoData } = await supabase
        .from('historico_observacoes')
        .select('id')
        .eq('solicitacao_id', selectedSolicitacao.id)
        .single();

      if (historicoData) {
        const { error: historicoError } = await supabase
          .from('historico_observacoes')
          .update({
            valor_final: valorFinal ? parseFloat(valorFinal) : null,
            status_evento: status,
            comprovante_url: comprovanteUrl || null
          })
          .eq('id', historicoData.id);

        if (historicoError) throw historicoError;
      }

      toast.success("Solicitação atualizada com sucesso!");
      setDialogOpen(false);
      loadSolicitacoes();
    } catch (error: any) {
      toast.error("Erro ao atualizar solicitação: " + error.message);
    } finally {
      setUpdating(false);
    }
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
            <TabsTrigger value="saque_quinzenal">Mudança de Saque</TabsTrigger>
            <TabsTrigger value="segunda_chance">Segunda Chance</TabsTrigger>
            <TabsTrigger value="outro">Outras Solicitações</TabsTrigger>
            <TabsTrigger value="saque">Saque</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Nome, email ou tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Data Inicial
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              Data Final
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {(searchQuery || startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar filtros
          </Button>
        )}
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
                      <th className="text-left p-4 text-sm font-medium">Horário</th>
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
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(new Date(item.created_at), "HH:mm", { locale: ptBR })}
                        </td>
                        <td className="p-4">{getStatusBadge(item.status)}</td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVisualizarClick(item)}
                          >
                            Atualizar
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

      {/* Dialog para atualizar solicitação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Solicitação de Saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSolicitacao && (
              <>
                <div>
                  <Label className="text-sm font-medium">Trader</Label>
                  <p className="text-sm">{selectedSolicitacao.profiles?.nome}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm">{getTipoLabel(selectedSolicitacao.tipo_solicitacao)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Valor Solicitado</Label>
                  <Input
                    type="text"
                    value={selectedSolicitacao.descricao ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(selectedSolicitacao.descricao)) 
                      : '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label>Valor Final</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorFinal}
                    onChange={(e) => setValorFinal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="efetuado">Efetuado</SelectItem>
                      <SelectItem value="atendida">Atendida</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === "efetuado" && (
                  <div>
                    <Label>Comprovante</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
                    </div>
                    {comprovanteUrl && (
                      <a 
                        href={comprovanteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        <Upload className="w-3 h-3" />
                        Ver comprovante anexado
                      </a>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleUpdateSolicitacao} 
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? 'Salvando...' : 'Salvar Atualização'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
