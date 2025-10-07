import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, ScrollText, Key, LogOut } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const SuperAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const MASTER_KEY = "PRIME_CAPITAL_SUPER_ADMIN_2025"; // Em produção, isso deve vir de variável de ambiente

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar autenticado",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "admin") {
        toast({
          title: "Acesso negado",
          description: "Apenas administradores têm acesso",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
      navigate("/");
    }
  };

  const handleMasterKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === MASTER_KEY) {
      setAuthenticated(true);
      toast({
        title: "Acesso concedido",
        description: "Bem-vindo ao painel super admin"
      });
    } else {
      toast({
        title: "Chave incorreta",
        description: "Chave mestra inválida",
        variant: "destructive"
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: {
          email: newAdminEmail,
          password: newAdminPassword
        }
      });

      if (error) throw error;

      toast({
        title: "Admin criado",
        description: `Novo administrador criado: ${newAdminEmail}`
      });

      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (changePasswordData.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso"
      });

      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-system-logs");

      if (error) throw error;

      setLogs(data.logs || []);
      toast({
        title: "Logs carregados",
        description: `${data.logs?.length || 0} registros encontrados`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Área Super Restrita
            </CardTitle>
            <CardDescription>
              Digite a chave mestra para acessar o painel de controle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMasterKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterKey">Chave Mestra</Label>
                <Input
                  id="masterKey"
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Digite a chave mestra"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Acessar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Control Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento avançado do sistema
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="admins" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admins">
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Admin
            </TabsTrigger>
            <TabsTrigger value="password">
              <Key className="h-4 w-4 mr-2" />
              Trocar Senha
            </TabsTrigger>
            <TabsTrigger value="logs">
              <ScrollText className="h-4 w-4 mr-2" />
              Logs do Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Administrador</CardTitle>
                <CardDescription>
                  Crie uma nova conta de administrador com acesso total ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do Administrador</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Administrador
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={changePasswordData.newPassword}
                      onChange={(e) => setChangePasswordData({
                        ...changePasswordData,
                        newPassword: e.target.value
                      })}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={changePasswordData.confirmPassword}
                      onChange={(e) => setChangePasswordData({
                        ...changePasswordData,
                        confirmPassword: e.target.value
                      })}
                      placeholder="Digite a senha novamente"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>
                  Visualize todos os logs de auditoria e atividades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={fetchLogs} className="w-full">
                  <ScrollText className="h-4 w-4 mr-2" />
                  Carregar Logs
                </Button>
                
                {logs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Registros ({logs.length})</Label>
                    <Textarea
                      value={JSON.stringify(logs, null, 2)}
                      readOnly
                      className="font-mono text-xs h-96"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdmin;
