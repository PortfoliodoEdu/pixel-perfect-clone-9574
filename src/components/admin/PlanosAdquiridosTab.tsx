import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PlanosAdquiridosTab = () => {
  const [planosAdquiridos, setPlanosAdquiridos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<any>(null);
  const [newObservacao, setNewObservacao] = useState("");
  const [editingPlano, setEditingPlano] = useState<any>(null);
  const [formData, setFormData] = useState<{
    cliente_id: string;
    plano_id: string;
    status_plano: "ativo" | "eliminado" | "pausado" | "segunda_chance" | "sim_rem" | "teste_1" | "teste_2";
    tipo_saque: "mensal" | "quinzenal";
    id_carteira: string;
  }>({
    cliente_id: "",
    plano_id: "",
    status_plano: "ativo",
    tipo_saque: "mensal",
    id_carteira: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: pa }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("planos_adquiridos").select(`
        *,
        profiles:cliente_id(nome, email),
        planos:plano_id(nome_plano)
      `).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("planos").select("*"),
    ]);
    
    if (pa) setPlanosAdquiridos(pa);
    if (c) setClientes(c);
    if (p) setPlanos(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlano) {
        const { error } = await supabase
          .from("planos_adquiridos")
          .update({
            plano_id: formData.plano_id,
            status_plano: formData.status_plano,
            tipo_saque: formData.tipo_saque
          })
          .eq("id", editingPlano.id);
        
        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        // Buscar o próximo ID de carteira sequencial para o trader
        const { data: existingPlans } = await supabase
          .from("planos_adquiridos")
          .select("id_carteira")
          .eq("cliente_id", formData.cliente_id)
          .order("created_at", { ascending: false });

        let nextId = 1;
        if (existingPlans && existingPlans.length > 0) {
          const lastId = existingPlans[0].id_carteira;
          const numericPart = parseInt(lastId);
          if (!isNaN(numericPart)) {
            nextId = numericPart + 1;
          }
        }

        const id_carteira = String(nextId).padStart(3, '0');

        const { error } = await supabase
          .from("planos_adquiridos")
          .insert([{
            cliente_id: formData.cliente_id,
            plano_id: formData.plano_id,
            status_plano: formData.status_plano,
            tipo_saque: formData.tipo_saque,
            id_carteira
          }]);
        
        if (error) throw error;
        toast.success(`Plano adquirido criado com ID de carteira: ${id_carteira}`);
      }
      
      setOpen(false);
      setFormData({ cliente_id: "", plano_id: "", status_plano: "ativo", tipo_saque: "mensal", id_carteira: "" });
      setEditingPlano(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (plano: any) => {
    setEditingPlano(plano);
    setFormData({
      cliente_id: plano.cliente_id,
      plano_id: plano.plano_id,
      status_plano: plano.status_plano,
      tipo_saque: plano.tipo_saque,
      id_carteira: plano.id_carteira,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano adquirido?")) return;
    
    try {
      const { error } = await supabase
        .from("planos_adquiridos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Plano excluído com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openHistory = async (plano: any) => {
    const { data } = await supabase
      .from("historico_observacoes")
      .select("*")
      .eq("plano_adquirido_id", plano.id)
      .order("created_at", { ascending: false });
    
    setSelectedPlano({ ...plano, historico: data || [] });
    setHistoryOpen(true);
  };

  const addObservacao = async () => {
    if (!newObservacao.trim()) return;
    
    try {
      const { error } = await supabase
        .from("historico_observacoes")
        .insert([{
          plano_adquirido_id: selectedPlano.id,
          observacao: newObservacao,
        }]);
      
      if (error) throw error;
      toast.success("Observação adicionada!");
      setNewObservacao("");
      openHistory(selectedPlano);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      eliminado: "destructive",
      segunda_chance: "secondary",
      ativo: "default",
      pausado: "outline",
    };
    return <Badge variant={colors[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Planos Adquiridos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPlano(null); setFormData({ cliente_id: "", plano_id: "", status_plano: "ativo", tipo_saque: "mensal", id_carteira: "" }); }}>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Plano
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlano ? "Editar Plano Adquirido" : "Novo Plano Adquirido"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plano</Label>
                <Select value={formData.plano_id} onValueChange={(value) => setFormData({ ...formData, plano_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome_plano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status_plano} onValueChange={(value: any) => setFormData({ ...formData, status_plano: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="eliminado">Eliminado</SelectItem>
                    <SelectItem value="segunda_chance">Segunda Chance</SelectItem>
                    <SelectItem value="teste_1">Teste 1</SelectItem>
                    <SelectItem value="teste_2">Teste 2</SelectItem>
                    <SelectItem value="sim_rem">Sim. Rem.</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Saque</Label>
                <Select value={formData.tipo_saque} onValueChange={(value: any) => setFormData({ ...formData, tipo_saque: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingPlano && (
                <div>
                  <Label>ID da Carteira</Label>
                  <Input
                    value={formData.id_carteira}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">ID da carteira é gerado automaticamente</p>
                </div>
              )}
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>ID Carteira</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo Saque</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planosAdquiridos.map((pa) => (
            <TableRow key={pa.id}>
              <TableCell>{pa.profiles?.nome || "-"}</TableCell>
              <TableCell>{pa.planos?.nome_plano || "-"}</TableCell>
              <TableCell>{pa.id_carteira}</TableCell>
              <TableCell>{getStatusBadge(pa.status_plano)}</TableCell>
              <TableCell>{pa.tipo_saque}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pa)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openHistory(pa)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(pa.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Observações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedPlano?.historico?.map((h: any) => (
                <div key={h.id} className="border-l-2 border-primary pl-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p>{h.observacao}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Nova observação..."
                value={newObservacao}
                onChange={(e) => setNewObservacao(e.target.value)}
              />
              <Button onClick={addObservacao}>Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanosAdquiridosTab;
