import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/mr3x-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={logo} alt="MR3X" className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-2xl" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-glow">
            MR3X
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Gestão de Pagamentos e Cobranças de Aluguéis
          </p>
          <p className="text-sm text-muted-foreground">
            Residenciais e Comerciais
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer group"
            onClick={() => navigate("/agencia")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Painel Agência</h3>
              <p className="text-sm text-muted-foreground">
                Criar acordos, gerenciar cobranças e emitir notificações extrajudiciais
              </p>
              <Button className="w-full gradient-primary">
                Acessar
              </Button>
            </div>
          </Card>

          <Card 
            className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer group"
            onClick={() => navigate("/inquilino")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <User className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Painel Inquilino</h3>
              <p className="text-sm text-muted-foreground">
                Visualizar acordos, assinar digitalmente e realizar pagamentos
              </p>
              <Button className="w-full gradient-primary">
                Acessar
              </Button>
            </div>
          </Card>

          <Card 
            className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer group"
            onClick={() => navigate("/verificar")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Verificador</h3>
              <p className="text-sm text-muted-foreground">
                Verificar autenticidade de documentos através do hash SHA-256
              </p>
              <Button className="w-full gradient-primary">
                Verificar
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <Card className="glass-card p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Recursos da Plataforma</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-foreground mb-2">🔐 Segurança Total</h4>
                <p className="text-sm text-muted-foreground">
                  Hash SHA-256, assinaturas eletrônicas e registro de IP/timestamp
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">💳 Múltiplas Formas de Pagamento</h4>
                <p className="text-sm text-muted-foreground">
                  PIX, Boleto, Cartão de Crédito e Links de Pagamento
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">📄 Documentos Legais</h4>
                <p className="text-sm text-muted-foreground">
                  Acordos e notificações extrajudiciais com validade jurídica
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">🎯 Descontos Progressivos</h4>
                <p className="text-sm text-muted-foreground">
                  Configure regras de desconto por prazo de pagamento
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">⏰ Agendamento Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Cobranças programadas com padrão de 48 horas
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">✅ Rastreamento Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Histórico de eventos e logs imutáveis para auditoria
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
