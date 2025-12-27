import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Trash2, Calendar, AlertTriangle, Percent, TrendingDown } from "lucide-react";
import { InstallmentPlan } from "@/lib/storage";

interface InstallmentPlannerProps {
  totalAmount: number;
  interestAmount?: number;
  onPlansChange: (plans: InstallmentPlan[]) => void;
}

// Tabela de descontos progressivos por número de parcelas
const DISCOUNT_TABLE = [
  { maxInstallments: 1, discountPercent: 50, label: "À Vista", color: "bg-emerald-500 dark:bg-emerald-600" },
  { maxInstallments: 2, discountPercent: 40, label: "2x", color: "bg-green-500 dark:bg-green-600" },
  { maxInstallments: 3, discountPercent: 30, label: "3x", color: "bg-lime-500 dark:bg-lime-600" },
  { maxInstallments: 4, discountPercent: 25, label: "4x", color: "bg-yellow-500 dark:bg-yellow-600" },
  { maxInstallments: 5, discountPercent: 20, label: "5x", color: "bg-amber-500 dark:bg-amber-600" },
  { maxInstallments: 6, discountPercent: 15, label: "6x", color: "bg-orange-500 dark:bg-orange-600" },
  { maxInstallments: 12, discountPercent: 10, label: "7-12x", color: "bg-red-400 dark:bg-red-500" },
];

const getDiscountForInstallments = (count: number) => {
  for (const tier of DISCOUNT_TABLE) {
    if (count <= tier.maxInstallments) {
      return tier;
    }
  }
  return { maxInstallments: count, discountPercent: 5, label: `${count}x`, color: "bg-muted" };
};

const InstallmentPlanner = ({ totalAmount, interestAmount = 0, onPlansChange }: InstallmentPlannerProps) => {
  const [plans, setPlans] = useState<InstallmentPlan[]>([
    {
      installmentNumber: 1,
      value: totalAmount,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0],
      discount: 0,
      finalValue: totalAmount,
    },
  ]);

  const [applyToTotal, setApplyToTotal] = useState(false);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [showTotalWarning, setShowTotalWarning] = useState(false);

  const currentDiscountTier = getDiscountForInstallments(plans.length);

  // Atualizar desconto automático quando número de parcelas muda
  useEffect(() => {
    if (autoDiscount) {
      applyProgressiveDiscount();
    }
  }, [plans.length, autoDiscount, applyToTotal]);

  const calculateDiscount = (baseValue: number, discountPercent: number) => {
    if (applyToTotal) {
      return baseValue * (discountPercent / 100);
    } else {
      // Desconto apenas sobre os juros proporcionais
      const interestPerInstallment = interestAmount / plans.length;
      return interestPerInstallment * (discountPercent / 100);
    }
  };

  const applyProgressiveDiscount = () => {
    const tier = getDiscountForInstallments(plans.length);
    const valuePerInstallment = totalAmount / plans.length;
    
    const updatedPlans = plans.map((p) => {
      const discountAmount = calculateDiscount(valuePerInstallment, tier.discountPercent);
      return {
        ...p,
        value: valuePerInstallment,
        discount: tier.discountPercent,
        finalValue: valuePerInstallment - discountAmount,
      };
    });
    
    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const addInstallment = () => {
    const lastPlan = plans[plans.length - 1];
    const nextDate = new Date(lastPlan.dueDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const newPlan: InstallmentPlan = {
      installmentNumber: plans.length + 1,
      value: totalAmount / (plans.length + 1),
      dueDate: nextDate.toISOString().split("T")[0],
      discount: 0,
      finalValue: totalAmount / (plans.length + 1),
    };

    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const removePlan = (index: number) => {
    if (plans.length === 1) return;
    const updatedPlans = plans.filter((_, i) => i !== index).map((p, i) => ({ ...p, installmentNumber: i + 1 }));
    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const updatePlan = (index: number, field: keyof InstallmentPlan, value: any) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    
    if (field === "value" || field === "discount") {
      const baseValue = parseFloat(updatedPlans[index].value.toString()) || 0;
      const discount = parseFloat(updatedPlans[index].discount.toString()) || 0;
      const discountAmount = applyToTotal 
        ? baseValue * discount / 100 
        : (interestAmount / plans.length) * discount / 100;
      updatedPlans[index].finalValue = baseValue - discountAmount;
    }

    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const distributeEqually = () => {
    const valuePerInstallment = totalAmount / plans.length;
    const tier = autoDiscount ? getDiscountForInstallments(plans.length) : { discountPercent: 0 };
    
    const updatedPlans = plans.map((p, i) => {
      const discountAmount = calculateDiscount(valuePerInstallment, autoDiscount ? tier.discountPercent : p.discount);
      return {
        ...p,
        value: valuePerInstallment,
        finalValue: valuePerInstallment - discountAmount,
      };
    });
    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const selectPresetInstallments = (count: number) => {
    const valuePerInstallment = totalAmount / count;
    const tier = getDiscountForInstallments(count);
    
    const newPlans: InstallmentPlan[] = [];
    for (let i = 0; i < count; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2 + (i * 30));
      
      const discountAmount = calculateDiscount(valuePerInstallment, tier.discountPercent);
      
      newPlans.push({
        installmentNumber: i + 1,
        value: valuePerInstallment,
        dueDate: dueDate.toISOString().split("T")[0],
        discount: tier.discountPercent,
        finalValue: valuePerInstallment - discountAmount,
      });
    }
    
    setPlans(newPlans);
    onPlansChange(newPlans);
  };

  const handleApplyToTotalChange = (checked: boolean) => {
    if (checked) {
      setShowTotalWarning(true);
    }
    setApplyToTotal(checked);
  };

  const totalFinal = plans.reduce((sum, p) => sum + p.finalValue, 0);
  const totalOriginal = plans.reduce((sum, p) => sum + p.value, 0);
  const totalSavings = totalOriginal - totalFinal;

  return (
    <Card className="glass-card p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Planejamento de Parcelas
          </h3>
          <Badge className={`${currentDiscountTier.color} text-white`}>
            {currentDiscountTier.discountPercent}% de desconto
          </Badge>
        </div>

        {/* Opções de desconto pré-definidas */}
        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
          <Label className="text-sm font-medium text-foreground mb-3 block">
            Escolha o número de parcelas (desconto progressivo nos juros):
          </Label>
          <div className="flex flex-wrap gap-2">
            {DISCOUNT_TABLE.map((tier) => (
              <Button
                key={tier.maxInstallments}
                variant={plans.length === tier.maxInstallments ? "default" : "outline"}
                size="sm"
                onClick={() => selectPresetInstallments(tier.maxInstallments)}
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  plans.length === tier.maxInstallments 
                    ? tier.color + " text-white border-0" 
                    : "hover:bg-muted"
                }`}
              >
                <span className="font-bold">{tier.label}</span>
                <span className="text-xs opacity-90">-{tier.discountPercent}%</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Configurações de desconto */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-card dark:bg-card/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              <Label htmlFor="auto-discount" className="text-sm">Desconto automático</Label>
            </div>
            <Switch
              id="auto-discount"
              checked={autoDiscount}
              onCheckedChange={setAutoDiscount}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-card dark:bg-card/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <Label htmlFor="apply-total" className="text-sm">Desconto no valor total</Label>
            </div>
            <Switch
              id="apply-total"
              checked={applyToTotal}
              onCheckedChange={handleApplyToTotalChange}
            />
          </div>
        </div>

        {/* Alerta para desconto no valor total */}
        {showTotalWarning && applyToTotal && (
          <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              O desconto será aplicado sobre o <strong>valor total da dívida</strong>, não apenas sobre os juros. 
              Isso pode resultar em perda significativa para a empresa. Use com cautela.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={distributeEqually} variant="outline" size="sm">
            Distribuir Igualmente
          </Button>
          <Button onClick={addInstallment} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Parcela
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className="p-4 border rounded-lg bg-card/50 dark:bg-card/30 hover:bg-card/80 dark:hover:bg-card/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">Parcela {plan.installmentNumber}</h4>
                <Badge variant="outline" className="text-xs">
                  {plan.discount}% desc.
                </Badge>
              </div>
              {plans.length > 1 && (
                <Button onClick={() => removePlan(index)} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label className="text-muted-foreground">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={plan.value}
                  onChange={(e) => updatePlan(index, "value", parseFloat(e.target.value) || 0)}
                  className="bg-background dark:bg-background/50"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Desconto (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={plan.discount}
                  onChange={(e) => updatePlan(index, "discount", parseFloat(e.target.value) || 0)}
                  disabled={autoDiscount}
                  className={`bg-background dark:bg-background/50 ${autoDiscount ? "opacity-50" : ""}`}
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Vencimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={plan.dueDate}
                    onChange={(e) => updatePlan(index, "dueDate", e.target.value)}
                    className="pl-8 bg-background dark:bg-background/50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Valor Final (R$)</Label>
                <Input 
                  value={plan.finalValue.toFixed(2)} 
                  disabled 
                  className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold border-emerald-200 dark:border-emerald-800" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo com cores claras/escuras */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Original</p>
            <p className="text-lg font-bold text-foreground">R$ {totalAmount.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Juros</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">R$ {interestAmount.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Final</p>
            <p className="text-lg font-bold text-primary">R$ {totalFinal.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Economia</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ {totalSavings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Legenda de descontos */}
      <div className="mt-4 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Tabela de Descontos Progressivos:</p>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_TABLE.map((tier) => (
            <span 
              key={tier.maxInstallments} 
              className={`text-xs px-2 py-1 rounded ${tier.color} text-white`}
            >
              {tier.label}: {tier.discountPercent}%
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          * Descontos aplicados {applyToTotal ? "sobre o valor total" : "apenas sobre os juros"} conforme normas de mercado
        </p>
      </div>
    </Card>
  );
};

export default InstallmentPlanner;