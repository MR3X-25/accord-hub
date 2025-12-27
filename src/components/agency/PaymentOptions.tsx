import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Smartphone, FileText, Link as LinkIcon, Save } from "lucide-react";
import { PaymentOption } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { saveAgreement, getAgreementById } from "@/lib/storage";
import { useSearchParams } from "react-router-dom";
import InstallmentPlanner from "./InstallmentPlanner";

interface PaymentOptionsProps {
  agreementData: any;
}

const PaymentOptions = ({ agreementData }: PaymentOptionsProps) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<any[]>([]);

  const principal = parseFloat(String(agreementData?.principalAmount ?? "")) || 0;
  const interestRate = parseFloat(String(agreementData?.interestRate ?? "")) || 0;
  const penaltyRate = parseFloat(String(agreementData?.penaltyRate ?? "")) || 0;

  const interestAmount = (principal * interestRate) / 100;
  const penaltyAmount = (principal * penaltyRate) / 100;
  const totalWithCharges = agreementData?.calculatedTotal ?? principal + interestAmount + penaltyAmount;

  const paymentMethods = [
    { id: "pix", name: "PIX", icon: Smartphone, description: "Pagamento instantâneo via QR Code", color: "text-cyan-500" },
    { id: "boleto", name: "Boleto Bancário", icon: FileText, description: "Pagamento via boleto com código de barras", color: "text-orange-500" },
    { id: "card", name: "Cartão de Crédito", icon: CreditCard, description: "Parcelamento em até 12x", color: "text-purple-500" },
    { id: "link", name: "Link de Pagamento", icon: LinkIcon, description: "Link único para múltiplas formas", color: "text-blue-500" },
  ];

  const toggleMethod = (methodId: string) => {
    setSelectedMethods((prev) =>
      prev.includes(methodId) ? prev.filter((id) => id !== methodId) : [...prev, methodId]
    );
  };

  const handleSavePaymentOptions = () => {
    if (selectedMethods.length === 0) {
      toast({ title: "Erro", description: "Selecione ao menos uma forma de pagamento", variant: "destructive" });
      return;
    }

    if (installmentPlans.length === 0) {
      toast({ title: "Erro", description: "Configure o plano de parcelas", variant: "destructive" });
      return;
    }

    const id = searchParams.get("id");
    if (!id) {
      toast({ title: "Erro", description: "Salve o acordo primeiro", variant: "destructive" });
      return;
    }

    const agreement = getAgreementById(id);
    if (!agreement) {
      toast({ title: "Erro", description: "Acordo não encontrado", variant: "destructive" });
      return;
    }

    const paymentOptions: PaymentOption[] = selectedMethods.map((method) => ({
      id: `${method}-${Date.now()}`,
      method: method as any,
      installments: installmentPlans.length,
      installmentValue: installmentPlans[0]?.finalValue || 0,
      totalValue: installmentPlans.reduce((sum, p) => sum + p.finalValue, 0),
      discount: installmentPlans[0]?.discount || 0,
      dueDate: installmentPlans[0]?.dueDate,
    }));

    const updatedAgreement = {
      ...agreement,
      paymentOptions,
      installmentPlans,
      updatedAt: new Date().toISOString(),
    };

    saveAgreement(updatedAgreement);

    toast({
      title: "Formas de pagamento salvas",
      description: `${selectedMethods.length} forma(s) de pagamento configurada(s) com ${installmentPlans.length} parcela(s)`,
    });
  };

  if (!agreementData || !agreementData.calculatedTotal) {
    return (
      <Card className="glass-card p-6">
        <p className="text-center text-muted-foreground">Salve o acordo primeiro para configurar formas de pagamento.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 text-foreground">Formas de Pagamento Disponíveis</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione as formas de pagamento que o inquilino poderá escolher
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethods.includes(method.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleMethod(method.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox checked={selectedMethods.includes(method.id)} onCheckedChange={() => toggleMethod(method.id)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <method.icon className={`w-5 h-5 ${method.color}`} />
                    <h4 className="font-semibold text-foreground">{method.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedMethods.length > 0 && (
        <InstallmentPlanner
          totalAmount={totalWithCharges}
          interestAmount={interestAmount}
          originalAmount={principal}
          onPlansChange={setInstallmentPlans}
        />
      )}

      {selectedMethods.length > 0 && installmentPlans.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSavePaymentOptions} className="gap-2 gradient-primary">
            <Save className="w-4 h-4" />
            Salvar Formas de Pagamento
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;
