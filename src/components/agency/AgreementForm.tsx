import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgreementFormProps {
  onDataChange: (data: any) => void;
}

const AgreementForm = ({ onDataChange }: AgreementFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractId: "",
    creditorName: "",
    creditorCpfCnpj: "",
    debtorName: "",
    debtorCpfCnpj: "",
    propertyAddress: "",
    debtPeriod: "",
    principalAmount: "",
    interestRate: "2",
    penaltyRate: "10",
    additionalFees: "",
  });

  const [installments, setInstallments] = useState<Array<{ date: string; amount: string }>>([
    { date: "", amount: "" }
  ]);

  const [discounts, setDiscounts] = useState<Array<{ type: string; value: string; validDays: string }>>([
    { type: "percent", value: "10", validDays: "7" }
  ]);

  const handleAddInstallment = () => {
    setInstallments([...installments, { date: "", amount: "" }]);
  };

  const handleRemoveInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleAddDiscount = () => {
    setDiscounts([...discounts, { type: "percent", value: "", validDays: "" }]);
  };

  const handleRemoveDiscount = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
  };

  const calculateSimulation = () => {
    const principal = parseFloat(formData.principalAmount) || 0;
    const interest = (principal * parseFloat(formData.interestRate)) / 100;
    const penalty = (principal * parseFloat(formData.penaltyRate)) / 100;
    const fees = parseFloat(formData.additionalFees) || 0;
    const total = principal + interest + penalty + fees;

    toast({
      title: "Simulação Calculada",
      description: `Total: R$ ${total.toFixed(2)} | Juros: R$ ${interest.toFixed(2)} | Multa: R$ ${penalty.toFixed(2)}`,
    });

    onDataChange({ ...formData, installments, discounts, calculatedTotal: total });
  };

  return (
    <div className="space-y-6">
      {/* Creditor & Debtor Information */}
      <Card className="p-6 bg-card/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Dados das Partes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contractId">ID do Contrato *</Label>
            <Input
              id="contractId"
              placeholder="Ex: CONT-2024-001"
              value={formData.contractId}
              onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="creditorName">Nome do Credor *</Label>
            <Input
              id="creditorName"
              placeholder="Ex: Imobiliária Alpha"
              value={formData.creditorName}
              onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="creditorCpf">CPF/CNPJ do Credor *</Label>
            <Input
              id="creditorCpf"
              placeholder="00.000.000/0000-00"
              value={formData.creditorCpfCnpj}
              onChange={(e) => setFormData({ ...formData, creditorCpfCnpj: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="debtorName">Nome do Devedor *</Label>
            <Input
              id="debtorName"
              placeholder="Ex: João Silva"
              value={formData.debtorName}
              onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="debtorCpf">CPF/CNPJ do Devedor *</Label>
            <Input
              id="debtorCpf"
              placeholder="000.000.000-00"
              value={formData.debtorCpfCnpj}
              onChange={(e) => setFormData({ ...formData, debtorCpfCnpj: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="propertyAddress">Endereço do Imóvel *</Label>
            <Input
              id="propertyAddress"
              placeholder="Rua, número, bairro, cidade"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Financial Details */}
      <Card className="p-6 bg-card/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Valores e Encargos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="debtPeriod">Período em Atraso</Label>
            <Input
              id="debtPeriod"
              placeholder="Ex: Jan/2024 - Mar/2024"
              value={formData.debtPeriod}
              onChange={(e) => setFormData({ ...formData, debtPeriod: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="principalAmount">Valor Principal (R$) *</Label>
            <Input
              id="principalAmount"
              type="number"
              placeholder="0.00"
              value={formData.principalAmount}
              onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Juros Mensais (%)</Label>
            <Input
              id="interestRate"
              type="number"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="penaltyRate">Multa Contratual (%)</Label>
            <Input
              id="penaltyRate"
              type="number"
              value={formData.penaltyRate}
              onChange={(e) => setFormData({ ...formData, penaltyRate: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="additionalFees">Taxas Adicionais (R$)</Label>
            <Input
              id="additionalFees"
              type="number"
              placeholder="Tarifa administrativa, DOC/TED, etc"
              value={formData.additionalFees}
              onChange={(e) => setFormData({ ...formData, additionalFees: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Installments */}
      <Card className="p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Parcelamento</h3>
          <Button onClick={handleAddInstallment} size="sm" variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Parcela
          </Button>
        </div>
        <div className="space-y-3">
          {installments.map((installment, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={installment.date}
                  onChange={(e) => {
                    const newInstallments = [...installments];
                    newInstallments[idx].date = e.target.value;
                    setInstallments(newInstallments);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={installment.amount}
                  onChange={(e) => {
                    const newInstallments = [...installments];
                    newInstallments[idx].amount = e.target.value;
                    setInstallments(newInstallments);
                  }}
                />
              </div>
              {installments.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveInstallment(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Discounts */}
      <Card className="p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Descontos Progressivos</h3>
          <Button onClick={handleAddDiscount} size="sm" variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Desconto
          </Button>
        </div>
        <div className="space-y-3">
          {discounts.map((discount, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Tipo</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={discount.type}
                  onChange={(e) => {
                    const newDiscounts = [...discounts];
                    newDiscounts[idx].type = e.target.value;
                    setDiscounts(newDiscounts);
                  }}
                >
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Fixo (R$)</option>
                </select>
              </div>
              <div className="flex-1">
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={discount.value}
                  onChange={(e) => {
                    const newDiscounts = [...discounts];
                    newDiscounts[idx].value = e.target.value;
                    setDiscounts(newDiscounts);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Válido até (dias)</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={discount.validDays}
                  onChange={(e) => {
                    const newDiscounts = [...discounts];
                    newDiscounts[idx].validDays = e.target.value;
                    setDiscounts(newDiscounts);
                  }}
                />
              </div>
              {discounts.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDiscount(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Calculate Button */}
      <Button onClick={calculateSimulation} className="w-full gradient-primary">
        <Calculator className="w-4 h-4 mr-2" />
        Calcular Simulação
      </Button>
    </div>
  );
};

export default AgreementForm;
