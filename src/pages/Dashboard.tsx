import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WithdrawalRequestDialog } from "@/components/dashboard/WithdrawalRequestDialog";
import { BiweeklyWithdrawalDialog } from "@/components/dashboard/BiweeklyWithdrawalDialog";
import { SecondChanceDialog } from "@/components/dashboard/SecondChanceDialog";
import { CommentsDialog } from "@/components/dashboard/CommentsDialog";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { ProfilePictureUpload } from "@/components/dashboard/ProfilePictureUpload";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import logoImage from "@/assets/logo-prime.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [planosAdquiridos, setPlanosAdquiridos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<{
    type: 'withdrawal' | 'biweekly' | 'secondChance' | 'comments' | null;
    planId: string;
  }>({ type: null, planId: '' });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          loadUserData(session.user.id);
        } else {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      const { data: planosData } = await supabase
        .from("planos_adquiridos")
        .select(`
          *,
          planos:plano_id(nome_plano),
          historico_observacoes(*)
        `)
        .eq("cliente_id", userId)
        .order("created_at", { ascending: false });

      setPlanosAdquiridos(planosData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleBackToSite = () => {
    window.location.href = "/";
  };

  const handleContratarPlano = () => {
    window.location.href = "/";
  };

  const handleContatarSuporte = () => {
    window.open("https://wa.me/", "_blank");
  };

  const openDialog = (type: 'withdrawal' | 'biweekly' | 'secondChance' | 'comments', planId: string) => {
    setActiveDialog({ type, planId });
  };

  const closeDialog = () => {
    setActiveDialog({ type: null, planId: '' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      eliminado: { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", label: "Eliminado" },
      segunda_chance: { className: "bg-orange-500 text-white hover:bg-orange-600", label: "Segunda Chance" },
      teste_1: { className: "bg-orange-500 text-white hover:bg-orange-600", label: "Teste 1" },
      teste_2: { className: "bg-orange-500 text-white hover:bg-orange-600", label: "Teste 2" },
      sim_rem: { className: "bg-green-500 text-white hover:bg-green-600", label: "Simulador Rem." },
      ativo: { className: "bg-blue-500 text-white hover:bg-blue-600", label: "Ativo" },
      pausado: { className: "bg-gray-500 text-white hover:bg-gray-600", label: "Pausado" },
    };

    const config = statusMap[status] || statusMap.ativo;
    return <Badge className={config.className}>● {config.label}</Badge>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with gradient */}
      <header className="gradient-header px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Prime Capital" className="w-12 h-12 rounded-lg" />
          <h1 className="text-white text-2xl font-light">
            prime<span className="font-light italic">capital</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-xl font-bold">
            Painel do Trader
          </span>
          <span className="text-white text-sm">- Voltar para o site</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Profile Section */}
          <div className="bg-white rounded-lg p-8 mb-8 relative">
            <div className="absolute top-6 right-6">
              <UserMenu onLogout={handleLogout} onBackToSite={handleBackToSite} />
            </div>
            
            <div className="flex items-center gap-8">
              <ProfilePictureUpload
                userId={session!.user.id}
                currentPhotoUrl={profile?.foto_perfil}
                userName={profile?.nome || "Trader"}
                onUploadComplete={(url) => setProfile({ ...profile, foto_perfil: url })}
              />
              
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  Olá, <span className="text-primary">{profile?.nome || "Trader"}</span>.
                </h2>
                <p className="text-foreground/70 text-sm">
                  {profile?.informacoes_personalizadas || 
                    "Seja bem vindo ao Painel do Trader. Aqui você poderá controlar todas as funções da sua conta na nossa mesa proprietária."}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleContratarPlano}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 text-sm"
                  >
                    COMPRAR UM PLANO
                  </Button>
                  <Button
                    onClick={handleContatarSuporte}
                    className="bg-foreground hover:bg-foreground/90 text-white font-bold px-6 py-2.5 text-sm"
                  >
                    CONTATAR SUPORTE
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-foreground">Planos adquiridos</h3>

            {planosAdquiridos.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-foreground/70 text-base">Nenhum plano adquirido ainda</p>
              </div>
            ) : (
              planosAdquiridos.map((plano) => (
                <div key={plano.id} className="bg-white rounded-lg overflow-hidden">
                  {planosAdquiridos.indexOf(plano) === 0 && (
                    <div className="bg-muted/30 px-6 py-4 grid grid-cols-5 gap-4 text-sm font-medium text-foreground/70 border-b">
                      <div>ID da Carteira</div>
                      <div>Tipo de plano</div>
                      <div>Status do Plano</div>
                      <div>Saque</div>
                      <div>Solicitações</div>
                    </div>
                  )}
                  
                  <div className="px-6 py-6 grid grid-cols-5 gap-4 items-center">
                    <div className="text-foreground font-medium">{plano.id_carteira}</div>
                    <div className="text-foreground font-medium">{plano.planos?.nome_plano || '-'}</div>
                    <div>{getStatusBadge(plano.status_plano)}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-foreground font-medium">
                        {plano.tipo_saque === 'mensal' ? 'Mensal' : 'Quinzenal'}
                      </span>
                      <Calendar className="w-4 h-4 text-foreground/50" />
                      <span className="text-foreground/50 text-xs">
                        mudar para {plano.tipo_saque === 'mensal' ? 'quinzenal' : 'mensal'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openDialog('biweekly', plano.id)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDialog('withdrawal', plano.id)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDialog('comments', plano.id)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDialog('secondChance', plano.id)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="px-6 pb-6 space-y-2 border-t pt-4">
                    <div className="text-sm font-medium text-foreground mb-3">Linha do tempo</div>
                    {plano.historico_observacoes && plano.historico_observacoes.length > 0 ? (
                      <div className="text-sm text-foreground/70 space-y-1">
                        {plano.historico_observacoes.map((obs: any) => (
                          <div key={obs.id} className="flex items-center gap-2">
                            <span>{new Date(obs.created_at).toLocaleDateString('pt-BR')}</span>
                            <span>|</span>
                            <span>{obs.observacao}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-foreground/70">Nenhuma solicitação.</div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Status da plataforma Section */}
            <div className="bg-white rounded-lg p-8 space-y-6">
              <h3 className="text-3xl font-bold text-foreground">Status da plataforma</h3>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-foreground">A plataforma não está ativa</span>
              </div>
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                  ATIVAR PROFIT ONE
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                  ATIVAR PROFIT PRO
                </Button>
                <Button className="bg-foreground hover:bg-foreground/90 text-white font-bold px-8">
                  DESATIVAR PLANO
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">R$ 90,00 por mês</p>
                  <p className="text-sm text-foreground/70">Primeiro mês grátis para novos usuários</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">R$ 220,00 por mês</p>
                </div>
              </div>
            </div>

            {/* Informações cadastrais Section */}
            <div className="bg-white rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Informações cadastrais</h3>
                <p className="text-foreground/70">
                  Preencha todos os dados para que você não tenha nenhum problema ao solicitar um saque.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Nome completo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                    defaultValue={profile?.nome}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Data de nascimento</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Telefone</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                    defaultValue={profile?.email}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">CPF</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Rua e Bairro</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Número residencial</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">CEP</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Estado</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-muted/30 border-0"
                  />
                </div>
              </div>

              {/* Document Upload Buttons */}
              {session && (
                <DocumentUpload
                  userId={session.user.id}
                  onUploadComplete={() => loadUserData(session.user.id)}
                />
              )}

              <div className="pt-4">
                <p className="text-sm text-foreground/70 mb-4">
                  Ao salvar, você está de acordo com o nosso regulamento atual. Vale lembrar que qualquer saque é efetuado apenas para chave PIX cadastrada no CPF do trader.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 py-3">
                  SALVAR
                </Button>
              </div>
            </div>

            {/* Status Legend */}
            <div className="bg-white rounded-lg p-6 mt-8">
              <h4 className="text-xl font-bold text-foreground mb-6">Entenda o status do seu plano:</h4>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-bold text-foreground">Teste 1 / Teste 2</span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Você está nesta primeira fase. Vamos aguardar você atingir a meta para que possa passar para próxima etapa. Caso seja um plano Economic, terá o Teste 1 e 2, caso não, terá apenas Teste 1.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-bold text-foreground">Segunda chance</span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Você falhou no teste e solicitou uma segunda chance para passar na primeira fase
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="font-bold text-foreground">Eliminado</span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Caso você bata o valor máximo de prejuízo ou descumpra alguma das regras do regulamento, será eliminado com esse status.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-bold text-foreground">Simulador Rem.</span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Nessa fase, todo valor que você fizer é apto para saque ou bater a meta no plano Skip ou a partir de R$ 100,00 nos demais planos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <WithdrawalRequestDialog
        open={activeDialog.type === 'withdrawal'}
        onOpenChange={closeDialog}
        planId={activeDialog.planId}
      />
      <BiweeklyWithdrawalDialog
        open={activeDialog.type === 'biweekly'}
        onOpenChange={closeDialog}
        planId={activeDialog.planId}
      />
      <SecondChanceDialog
        open={activeDialog.type === 'secondChance'}
        onOpenChange={closeDialog}
        planId={activeDialog.planId}
      />
      <CommentsDialog
        open={activeDialog.type === 'comments'}
        onOpenChange={closeDialog}
        planId={activeDialog.planId}
      />
    </div>
  );
};

export default Dashboard;
