import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Save } from "lucide-react";
import { saveAgreement, getAgreementById, generateHash, getClientIP, AgreementData } from "@/lib/storage";
import { generateAgreementToken, validateContractToken, formatContractToken } from "@/lib/tokenGenerator";
import { formatCpfCnpj, validateCpfCnpj, formatCEP, fetchAddressByCEP, formatCRECI, validateCRECI } from "@/lib/validators";
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
    agencyCep: "",
    brokerName: "",
    brokerCreci: "",
    creditorName: "",
    creditorCpfCnpj: "",
    creditorEmail: "",
    debtorName: "",
    debtorCpfCnpj: "",
    debtorEmail: "",
    contractId: "",
    propertyAddress: "",
    propertyCep: "",
    propertyCity: "",
    propertyState: "",
    debtPeriod: "",
    principalAmount: "",
    interestRate: "2",
    penaltyRate: "10",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const agreement = getAgreementById(id);
      if (agreement) {
        setFormData({
          agencyName: agreement.agencyName,
          agencyAddress: agreement.agencyAddress,
          agencyCnpj: agreement.agencyCnpj,
          agencyCep: agreement.propertyCep || "",
          brokerName: agreement.brokerName,
          brokerCreci: agreement.brokerCreci,
          creditorName: agreement.creditorName,
          creditorCpfCnpj: agreement.creditorCpfCnpj,
          creditorEmail: agreement.creditorEmail || "",
          debtorName: agreement.debtorName,
          debtorCpfCnpj: agreement.debtorCpfCnpj,
          debtorEmail: agreement.debtorEmail || "",
          contractId: agreement.contractId,
          propertyAddress: agreement.propertyAddress,
          propertyCep: agreement.propertyCep || "",
          propertyCity: agreement.propertyCity || "",
          propertyState: agreement.propertyState || "",
          debtPeriod: agreement.debtPeriod,
          principalAmount: agreement.principalAmount,
          interestRate: agreement.interestRate,
          penaltyRate: agreement.penaltyRate,
        });
      }
    }
  }, [searchParams]);

  const handleCpfCnpjChange = (field: string, value: string) => {
    const formatted = formatCpfCnpj(value);
    setFormData({ ...formData, [field]: formatted });
  };

  const handleCreciChange = (value: string) => {
    const formatted = formatCRECI(value);
    setFormData({ ...formData, brokerCreci: formatted });
  };

  const handleContractIdChange = (value: string) => {
    const formatted = formatContractToken(value);
    setFormData({ ...formData, contractId: formatted });
  };

  const handleCepChange = async (field: string, value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, [field]: formatted });

    if (formatted.replace(/\D/g, "").length === 8) {
      setLoading(true);
      const address = await fetchAddressByCEP(formatted);
      setLoading(false);

      if (address) {
        if (field === "agencyCep") {
          setFormData(prev => ({ ...prev, agencyAddress: `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}` }));
        } else if (field === "propertyCep") {
          setFormData(prev => ({
            ...prev,
            propertyAddress: `${address.logradouro}, ${address.bairro}`,
            propertyCity: address.localidade,
            propertyState: address.uf,
          }));
        }
        toast({ title: "Endereço encontrado", description: "Dados preenchidos automaticamente" });
      } else {
        toast({ title: "CEP não encontrado", description: "Verifique o CEP digitado", variant: "destructive" });
      }
    }
  };

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

    if (!validateCpfCnpj(formData.agencyCnpj)) {
      toast({ title: "CNPJ inválido", description: "Digite um CNPJ válido para a agência", variant: "destructive" });
      return;
    }

    if (!validateCpfCnpj(formData.creditorCpfCnpj)) {
      toast({ title: "CPF/CNPJ inválido", description: "Digite um CPF/CNPJ válido para o credor", variant: "destructive" });
      return;
    }

    if (!validateCpfCnpj(formData.debtorCpfCnpj)) {
      toast({ title: "CPF/CNPJ inválido", description: "Digite um CPF/CNPJ válido para o devedor", variant: "destructive" });
      return;
    }

    if (formData.brokerCreci && !validateCRECI(formData.brokerCreci)) {
      toast({ title: "CRECI inválido", description: "Formato de CRECI inválido", variant: "destructive" });
      return;
    }

    const contractValidation = validateContractToken(formData.contractId);
    if (!contractValidation.valid) {
      toast({ title: "Contrato inválido", description: contractValidation.message, variant: "destructive" });
      return;
    }

    const principal = parseFloat(formData.principalAmount) || 0;
    const interest = (principal * parseFloat(formData.interestRate)) / 100;
    const penalty = (principal * parseFloat(formData.penaltyRate)) / 100;
    const total = principal + interest + penalty;

    const id = searchParams.get("id") || generateAgreementToken();
    const dataString = JSON.stringify(formData) + Date.now();
    const hash = await generateHash(dataString);
    const ip = await getClientIP();

    const agreement: AgreementData = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData,
      calculatedTotal: total,
      paymentOptions: [],
      status: "draft",
      hash,
      ip,
    };

    saveAgreement(agreement);
    onDataChange(agreement);
    
    toast({
      title: "Acordo salvo",
      description: `Documento ${id} salvo com sucesso.`,
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
              <Input id="agencyCnpj" value={formData.agencyCnpj} onChange={(e) => handleCpfCnpjChange("agencyCnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label htmlFor="agencyCep">CEP</Label>
              <Input id="agencyCep" value={formData.agencyCep} onChange={(e) => handleCepChange("agencyCep", e.target.value)} placeholder="00000-000" disabled={loading} />
            </div>
            <div>
              <Label htmlFor="agencyAddress">Endereço *</Label>
              <Input id="agencyAddress" value={formData.agencyAddress} onChange={(e) => setFormData({ ...formData, agencyAddress: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="brokerName">Corretor *</Label>
              <Input id="brokerName" value={formData.brokerName} onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="brokerCreci">CRECI (Opcional)</Label>
              <Input id="brokerCreci" value={formData.brokerCreci} onChange={(e) => handleCreciChange(e.target.value)} placeholder="CRECI 12345-F" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Partes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Credor *</Label><Input value={formData.creditorName} onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })} /></div>
            <div><Label>CPF/CNPJ *</Label><Input value={formData.creditorCpfCnpj} onChange={(e) => handleCpfCnpjChange("creditorCpfCnpj", e.target.value)} /></div>
            <div><Label>Email Credor</Label><Input type="email" value={formData.creditorEmail} onChange={(e) => setFormData({ ...formData, creditorEmail: e.target.value })} /></div>
            <div><Label>Devedor *</Label><Input value={formData.debtorName} onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })} /></div>
            <div><Label>CPF/CNPJ *</Label><Input value={formData.debtorCpfCnpj} onChange={(e) => handleCpfCnpjChange("debtorCpfCnpj", e.target.value)} /></div>
            <div><Label>Email Devedor *</Label><Input type="email" value={formData.debtorEmail} onChange={(e) => setFormData({ ...formData, debtorEmail: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Contrato</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Número do Contrato *</Label>
              <Input value={formData.contractId} onChange={(e) => handleContractIdChange(e.target.value)} placeholder="Ex: CTR-2025-001 ou 12345" />
            </div>
            <div><Label>Período Atraso *</Label><Input value={formData.debtPeriod} onChange={(e) => setFormData({ ...formData, debtPeriod: e.target.value })} placeholder="Ex: Jan/2025 a Mar/2025" /></div>
            <div>
              <Label>CEP do Imóvel</Label>
              <Input value={formData.propertyCep} onChange={(e) => handleCepChange("propertyCep", e.target.value)} placeholder="00000-000" disabled={loading} />
            </div>
            <div><Label>Endereço Imóvel *</Label><Input value={formData.propertyAddress} onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })} /></div>
            <div><Label>Cidade</Label><Input value={formData.propertyCity} onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })} /></div>
            <div><Label>Estado</Label><Input value={formData.propertyState} onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })} maxLength={2} /></div>
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
          <Button onClick={handleSave} className="gap-2 gradient-primary" disabled={loading}><Save className="w-4 h-4" />Salvar</Button>
        </div>
      </div>
    </Card>
  );
};

export default AgreementForm;
