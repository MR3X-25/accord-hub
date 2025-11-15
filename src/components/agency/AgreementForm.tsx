import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Save } from "lucide-react";
import { saveAgreement, getAgreementById, generateHash, getClientIP, AgreementData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface AgreementFormProps {
  onDataChange: (data: any) => void;
}

const AgreementForm = ({ onDataChange }: AgreementFormProps) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    agencyName: "",
    agencyAddress: "",
    agencyCnpj: "",
    brokerName: "",
    brokerCreci: "",
    creditorName: "",
    creditorCpfCnpj: "",
    debtorName: "",
    debtorCpfCnpj: "",
    contractId: "",
    propertyAddress: "",
    debtPeriod: "",
    principalAmount: "",
    interestRate: "2",
    penaltyRate: "10",
  });

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const agreement = getAgreementById(id);
      if (agreement) {
        setFormData({
          agencyName: agreement.agencyName,
          agencyAddress: agreement.agencyAddress,
          agencyCnpj: agreement.agencyCnpj,
          brokerName: agreement.brokerName,
          brokerCreci: agreement.brokerCreci,
          creditorName: agreement.creditorName,
          creditorCpfCnpj: agreement.creditorCpfCnpj,
          debtorName: agreement.debtorName,
          debtorCpfCnpj: agreement.debtorCpfCnpj,
          contractId: agreement.contractId,
          propertyAddress: agreement.propertyAddress,
          debtPeriod: agreement.debtPeriod,
          principalAmount: agreement.principalAmount,
          interestRate: agreement.interestRate,
          penaltyRate: agreement.penaltyRate,
        });
      }
    }
  }, [searchParams]);

  const handleCalculate = () => {
    const principal = parseFloat(formData.principalAmount) || 0;
    const interest = (principal * parseFloat(formData.interestRate)) / 100;
    const penalty = (principal * parseFloat(formData.penaltyRate)) / 100;
    const total = principal + interest + penalty;

    onDataChange({ ...formData, calculatedTotal: total });
    
    toast({
      title: "Cálculo realizado",
      description: `Total: R$ ${total.toFixed(2)}`,
    });
  };

  const handleSave = async () => {
    if (!formData.agencyName || !formData.creditorName || !formData.debtorName) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const principal = parseFloat(formData.principalAmount) || 0;
    const interest = (principal * parseFloat(formData.interestRate)) / 100;
    const penalty = (principal * parseFloat(formData.penaltyRate)) / 100;
    const total = principal + interest + penalty;

    const id = searchParams.get("id") || `AGR-${Date.now()}`;
    const dataString = JSON.stringify(formData) + Date.now();
    const hash = await generateHash(dataString);
    const ip = await getClientIP();

    const agreement: AgreementData = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData,
      calculatedTotal: total,
      paymentMethods: [],
      status: "draft",
      hash,
      ip,
    };

    saveAgreement(agreement);
    onDataChange(agreement);
    
    toast({
      title: "Acordo salvo",
      description: "O acordo foi salvo com sucesso.",
    });
  };

  return (
    <Card className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Dados do Acordo</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Agência Responsável</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agencyName">Nome da Agência *</Label>
              <Input id="agencyName" value={formData.agencyName} onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })} placeholder="Ex: Imobiliária XYZ" />
            </div>
            <div>
              <Label htmlFor="agencyCnpj">CNPJ *</Label>
              <Input id="agencyCnpj" value={formData.agencyCnpj} onChange={(e) => setFormData({ ...formData, agencyCnpj: e.target.value })} placeholder="00.000.000/0000-00" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="agencyAddress">Endereço *</Label>
              <Input id="agencyAddress" value={formData.agencyAddress} onChange={(e) => setFormData({ ...formData, agencyAddress: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="brokerName">Corretor *</Label>
              <Input id="brokerName" value={formData.brokerName} onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="brokerCreci">CRECI *</Label>
              <Input id="brokerCreci" value={formData.brokerCreci} onChange={(e) => setFormData({ ...formData, brokerCreci: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Partes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Credor *</Label><Input value={formData.creditorName} onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })} /></div>
            <div><Label>CPF/CNPJ *</Label><Input value={formData.creditorCpfCnpj} onChange={(e) => setFormData({ ...formData, creditorCpfCnpj: e.target.value })} /></div>
            <div><Label>Devedor *</Label><Input value={formData.debtorName} onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })} /></div>
            <div><Label>CPF/CNPJ *</Label><Input value={formData.debtorCpfCnpj} onChange={(e) => setFormData({ ...formData, debtorCpfCnpj: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Contrato</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Nº Contrato *</Label><Input value={formData.contractId} onChange={(e) => setFormData({ ...formData, contractId: e.target.value })} /></div>
            <div><Label>Período Atraso *</Label><Input value={formData.debtPeriod} onChange={(e) => setFormData({ ...formData, debtPeriod: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Endereço Imóvel *</Label><Input value={formData.propertyAddress} onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Valores</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Valor Principal *</Label><Input type="number" value={formData.principalAmount} onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })} /></div>
            <div><Label>Juros (%) *</Label><Input type="number" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} /></div>
            <div><Label>Multa (%) *</Label><Input type="number" value={formData.penaltyRate} onChange={(e) => setFormData({ ...formData, penaltyRate: e.target.value })} /></div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button onClick={handleCalculate} variant="outline" className="gap-2"><Calculator className="w-4 h-4" />Calcular</Button>
          <Button onClick={handleSave} className="gap-2 gradient-primary"><Save className="w-4 h-4" />Salvar</Button>
        </div>
      </div>
    </Card>
  );
};

export default AgreementForm;
