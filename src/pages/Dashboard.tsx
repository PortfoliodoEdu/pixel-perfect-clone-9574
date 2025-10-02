import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Calendar, DollarSign, FileText, CheckSquare, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with gradient */}
      <header className="gradient-header px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
            <span className="text-primary font-bold text-xl italic">pi</span>
          </div>
          <h1 className="text-white text-3xl font-light">
            prime<span className="font-light italic">capital</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl font-bold">Painel do Trader</span>
          <button className="text-white flex items-center gap-2 text-sm hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o site
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Profile Section */}
          <div className="bg-white rounded-lg p-8 mb-8 relative">
            <button className="absolute top-6 right-6">
              <MoreVertical className="w-6 h-6 text-foreground" />
            </button>
            
            <div className="flex items-center gap-8">
              <Avatar className="w-40 h-40">
                <AvatarFallback className="bg-muted text-4xl">NP</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <h2 className="text-4xl font-bold text-foreground">
                  Olá, <span className="text-primary">Nome da Pessoa</span>.
                </h2>
                <p className="text-foreground/80 text-base">
                  Seja bem vindo ao Painel do Trader. Aqui você poderá controlar todas as funções da sua conta na nossa mesa proprietária.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-base">
                    COMPRAR UM PLANO
                  </Button>
                  <Button className="bg-foreground hover:bg-foreground/90 text-white font-bold px-8 py-6 text-base">
                    CONTATAR SUPORTE
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Section */}
          <div className="space-y-6">
            <h3 className="text-4xl font-bold text-foreground">Planos adquiridos</h3>

            {/* Plan 1 - Prime1200 */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 grid grid-cols-5 gap-4 text-sm font-medium text-foreground/70 border-b">
                <div>ID da Carteira</div>
                <div>Tipo de plano</div>
                <div>Status do Plano</div>
                <div>Saque</div>
                <div>Solicitações</div>
              </div>
              
              <div className="px-6 py-6 grid grid-cols-5 gap-4 items-center">
                <div className="text-foreground font-medium">0001</div>
                <div className="text-foreground font-medium">Prime1200</div>
                <div>
                  <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    ● Eliminado
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">Mensal</span>
                  <Calendar className="w-4 h-4 text-foreground/50" />
                  <span className="text-foreground/50 text-xs">mudar para quinzenal</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 pb-6 space-y-2 border-t pt-4">
                <div className="text-sm font-medium text-foreground mb-3">Linha do tempo</div>
                <div className="text-sm text-foreground/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <span>20/09/2025</span>
                    <span>|</span>
                    <span>Valor solicitado: R$ 1.000,00</span>
                    <span>|</span>
                    <span>Valor final: R$ 700,00</span>
                    <span>|</span>
                    <span>Status: <strong>Efetuado</strong></span>
                    <span>|</span>
                    <span>Comprovante</span>
                    <Pencil className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>19/09/2025</span>
                    <span>|</span>
                    <span>Valor solicitado: R$ 1.000,00</span>
                    <span>|</span>
                    <span>Valor final: R$ 700,00</span>
                    <span>|</span>
                    <span>Status: <strong>Negado - Fora do ciclo</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>15/09/2025</span>
                    <span>|</span>
                    <span>Valor solicitado: R$ 1.000,00</span>
                    <span>|</span>
                    <span>Valor final: R$ 700,00</span>
                    <span>|</span>
                    <span>Status: <strong>Negado - Sem saldo</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>10/09/2025</span>
                    <span>|</span>
                    <span>Aprovação solicitada</span>
                    <span>|</span>
                    <span>Status: <strong>Aprovado</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan 2 - Advanced20000 */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="px-6 py-6 grid grid-cols-5 gap-4 items-center">
                <div className="text-foreground font-medium">0002</div>
                <div className="text-foreground font-medium">Advanced20000</div>
                <div>
                  <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                    ● Teste 1
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">Mensal</span>
                  <Calendar className="w-4 h-4 text-foreground/50" />
                  <span className="text-foreground/50 text-xs">mudar para quinzenal</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 pb-6 border-t pt-4">
                <div className="text-sm font-medium text-foreground mb-3">Linha do tempo</div>
                <div className="text-sm text-foreground/70">Nenhuma solicitação.</div>
              </div>
            </div>

            {/* Plan 3 - Skip20000 */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="px-6 py-6 grid grid-cols-5 gap-4 items-center">
                <div className="text-foreground font-medium">0003</div>
                <div className="text-foreground font-medium">Skip20000</div>
                <div>
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    ● Simulador Rem.
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">Mensal</span>
                  <Calendar className="w-4 h-4 text-foreground/50" />
                  <span className="text-foreground/50 text-xs">mudar para quinzenal</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted/50">
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 pb-6 space-y-2 border-t pt-4">
                <div className="text-sm font-medium text-foreground mb-3">Linha do tempo</div>
                <div className="text-sm text-foreground/70">
                  <div className="flex items-center gap-2">
                    <span>10/09/2025</span>
                    <span>|</span>
                    <span>Aprovação solicitada</span>
                    <span>|</span>
                    <span>Status: <strong>Aprovado</strong></span>
                  </div>
                </div>
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
    </div>
  );
};

export default Dashboard;
