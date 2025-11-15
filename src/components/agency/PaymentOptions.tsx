import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { QrCode, CreditCard, Barcode, Link as LinkIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentOptionsProps {
  agreementData: any;
}

const PaymentOptions = ({ agreementData }: PaymentOptionsProps) => {
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["pix"]);
  const [scheduleHours, setScheduleHours] = useState("48");

  const paymentMethods = [
    {
      id: "pix",
      name: "PIX",
      icon: QrCode,
      description: "QR Code dinâmico com confirmação instantânea",
      available: true,
    },
    {
      id: "boleto",
      name: "Boleto Bancário",
      icon: Barcode,
      description: "Código de barras e linha digitável",
      available: true,
    },
    {
      id: "card",
      name: "Cartão de Crédito",
      icon: CreditCard,
      description: "Parcelamento em até 12x",
      available: true,
    },
    {
      id: "link",
      name: "Link de Pagamento",
      icon: LinkIcon,
      description: "URL única para pagamento online",
      available: true,
    },
  ];

  const toggleMethod = (methodId: string) => {
    if (selectedMethods.includes(methodId)) {
      setSelectedMethods(selectedMethods.filter(id => id !== methodId));
    } else {
      setSelectedMethods([...selectedMethods, methodId]);
    }
  };

  const handleGeneratePayment = () => {
    if (selectedMethods.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Formas de Pagamento Geradas",
      description: `${selectedMethods.length} método(s) criado(s). Agendamento: ${scheduleHours}h`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Formas de Pagamento</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione as formas de pagamento que deseja disponibilizar para o devedor.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethods.includes(method.id);

            return (
              <div
                key={method.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                onClick={() => toggleMethod(method.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">{method.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  {method.available && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Disponível
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 bg-card/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Agendamento de Cobrança
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure quando a cobrança será ativada e enviada ao devedor.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduleHours">Ativar cobrança em (horas)</Label>
            <Input
              id="scheduleHours"
              type="number"
              value={scheduleHours}
              onChange={(e) => setScheduleHours(e.target.value)}
              placeholder="48"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Padrão: 48 horas. A cobrança será criada e enviada automaticamente após este período.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Cobrança Agendada</p>
              <p className="text-xs text-muted-foreground">
                Será ativada em: {new Date(Date.now() + parseInt(scheduleHours) * 60 * 60 * 1000).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={handleGeneratePayment} className="w-full gradient-primary">
        Gerar Formas de Pagamento ({selectedMethods.length} selecionada{selectedMethods.length !== 1 ? 's' : ''})
      </Button>
    </div>
  );
};

export default PaymentOptions;
