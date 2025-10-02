import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with gradient */}
      <header className="gradient-header px-8 py-8 flex items-center justify-between">
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
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-foreground mb-4">Cadastro</h2>
              <p className="text-foreground/80 text-lg">
                Preencha todos os dados para realizar o cadastro.
              </p>
            </div>

            <form className="space-y-6">
              {/* Nome completo and Data de nascimento */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground text-base font-normal">
                    Nome completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-foreground text-base font-normal">
                    Data de nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* Telefone, Email, CPF */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground text-base font-normal">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-base font-normal">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-foreground text-base font-normal">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* Rua e Bairro and Número residencial */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-foreground text-base font-normal">
                    Rua e Bairro
                  </Label>
                  <Input
                    id="street"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-foreground text-base font-normal">
                    Número residencial
                  </Label>
                  <Input
                    id="number"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* CEP, Cidade, Estado */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-foreground text-base font-normal">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground text-base font-normal">
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground text-base font-normal">
                    Estado
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* Buttons and agreement text */}
              <div className="flex items-center gap-6 pt-6">
                <Button
                  type="button"
                  onClick={() => navigate("/")}
                  className="bg-foreground hover:bg-foreground/90 text-white font-bold text-lg px-12 py-6 rounded-lg transition-all"
                >
                  CANCELAR
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-12 py-6 rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                  CADASTRAR
                </Button>
                <p className="text-foreground/70 text-sm flex-1">
                  Ao cadastrar, você está de acordo com o nosso regulamento atual.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
