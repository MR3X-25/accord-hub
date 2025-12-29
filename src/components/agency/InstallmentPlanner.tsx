import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Calendar, AlertTriangle, Percent, TrendingDown } from "lucide-react";
import { InstallmentPlan } from "@/lib/storage";

interface InstallmentPlannerProps {
  /** Total com encargos (principal + juros + multa) */
  totalAmount: number;
  /** Juros total */
  interestAmount?: number;
  /** Multa total */
  penaltyAmount?: number;
  /** Valor original (principal sem encargos) */
  originalAmount?: number;
  onPlansChange: (plans: InstallmentPlan[]) => void;
}

// Tabela base de descontos progressivos por número de parcelas
const getDefaultDiscountTable = (baseDiscount: number) => [
  { maxInstallments: 1, discountPercent: baseDiscount, label: "À Vista", color: "bg-emerald-500 dark:bg-emerald-600" },
  { maxInstallments: 2, discountPercent: Math.round(baseDiscount * 0.8), label: "2x", color: "bg-green-500 dark:bg-green-600" },
  { maxInstallments: 3, discountPercent: Math.round(baseDiscount * 0.6), label: "3x", color: "bg-lime-500 dark:bg-lime-600" },
  { maxInstallments: 4, discountPercent: Math.round(baseDiscount * 0.5), label: "4x", color: "bg-yellow-500 dark:bg-yellow-600" },
  { maxInstallments: 5, discountPercent: Math.round(baseDiscount * 0.4), label: "5x", color: "bg-amber-500 dark:bg-amber-600" },
  { maxInstallments: 6, discountPercent: Math.round(baseDiscount * 0.3), label: "6x", color: "bg-orange-500 dark:bg-orange-600" },
  { maxInstallments: 12, discountPercent: Math.round(baseDiscount * 0.2), label: "7-12x", color: "bg-red-400 dark:bg-red-500" },
];

const InstallmentPlanner = ({ totalAmount, interestAmount = 0, penaltyAmount = 0, originalAmount, onPlansChange }: InstallmentPlannerProps) => {
  const [baseDiscountPercent, setBaseDiscountPercent] = useState(100);
  const [applyToTotal, setApplyToTotal] = useState(false);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [showTotalWarning, setShowTotalWarning] = useState(false);

  const discountTable = getDefaultDiscountTable(baseDiscountPercent);

  const getDiscountForInstallments = useCallback((count: number) => {
    for (const tier of discountTable) {
      if (count <= tier.maxInstallments) {
        return tier;
      }
    }
    return { maxInstallments: count, discountPercent: Math.round(baseDiscountPercent * 0.1), label: `${count}x`, color: "bg-muted" };
  }, [baseDiscountPercent, discountTable]);

  const calculateFinalValue = useCallback((baseValue: number, discountPercent: number, installmentCount: number) => {
    if (applyToTotal) {
      // Desconto sobre o valor total da parcela
      const discountAmount = baseValue * (discountPercent / 100);
      return Math.max(0, baseValue - discountAmount);
    } else {
      // Desconto apenas sobre os juros proporcionais
      const interestPerInstallment = interestAmount / installmentCount;
      const discountAmount = interestPerInstallment * (discountPercent / 100);
      return Math.max(0, baseValue - discountAmount);
    }
  }, [applyToTotal, interestAmount]);

  const createPlans = useCallback((count: number, discountPercent?: number) => {
    const valuePerInstallment = totalAmount / count;
    const effectiveDiscount = discountPercent ?? (autoDiscount ? getDiscountForInstallments(count).discountPercent : 0);
    
    const newPlans: InstallmentPlan[] = [];
    for (let i = 0; i < count; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2 + (i * 30));
      
      const finalValue = calculateFinalValue(valuePerInstallment, effectiveDiscount, count);
      
      newPlans.push({
        installmentNumber: i + 1,
        value: valuePerInstallment,
        dueDate: dueDate.toISOString().split("T")[0],
        discount: effectiveDiscount,
        finalValue: finalValue,
      });
    }
    
    return newPlans;
  }, [totalAmount, autoDiscount, getDiscountForInstallments, calculateFinalValue]);

  const [plans, setPlans] = useState<InstallmentPlan[]>(() => createPlans(1));

  // Recalcular quando parâmetros mudam
  useEffect(() => {
    const count = plans.length;
    if (count === 0) return;

    const tier = getDiscountForInstallments(count);
    const valuePerInstallment = totalAmount / count;

    const updatedPlans = plans.map((p) => {
      const value = autoDiscount ? valuePerInstallment : (Number(p.value) || 0);
      const discount = autoDiscount ? tier.discountPercent : (Number(p.discount) || 0);
      return {
        ...p,
        value,
        discount,
        finalValue: calculateFinalValue(value, discount, count),
      };
    });

    const changed = updatedPlans.some((p, i) => {
      const cur = plans[i];
      return !cur || p.value !== cur.value || p.discount !== cur.discount || p.finalValue !== cur.finalValue;
    });

    if (!changed) return;

    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  }, [
    autoDiscount,
    baseDiscountPercent,
    applyToTotal,
    totalAmount,
    interestAmount,
    plans,
    getDiscountForInstallments,
    calculateFinalValue,
    onPlansChange,
  ]);

  const addInstallment = () => {
    const newCount = plans.length + 1;
    const newPlans = createPlans(newCount);
    setPlans(newPlans);
    onPlansChange(newPlans);
  };

  const removePlan = (index: number) => {
    if (plans.length === 1) return;
    const newCount = plans.length - 1;
    const newPlans = createPlans(newCount);
    setPlans(newPlans);
    onPlansChange(newPlans);
  };

  const updatePlan = (index: number, field: keyof InstallmentPlan, value: any) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    
    if (field === "value" || field === "discount") {
      const baseValue = parseFloat(updatedPlans[index].value.toString()) || 0;
      const discount = parseFloat(updatedPlans[index].discount.toString()) || 0;
      updatedPlans[index].finalValue = calculateFinalValue(baseValue, discount, plans.length);
    }

    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const distributeEqually = () => {
    const tier = autoDiscount ? getDiscountForInstallments(plans.length) : { discountPercent: plans[0]?.discount || 0 };
    const newPlans = createPlans(plans.length, tier.discountPercent);
    setPlans(newPlans);
    onPlansChange(newPlans);
  };

  const selectPresetInstallments = (count: number) => {
    const newPlans = createPlans(count);
    setPlans(newPlans);
    onPlansChange(newPlans);
  };

  const handleApplyToTotalChange = (checked: boolean) => {
    if (checked) {
      setShowTotalWarning(true);
    }
    setApplyToTotal(checked);
  };

  const currentDiscountTier = getDiscountForInstallments(plans.length);
  const totalFinal = plans.reduce((sum, p) => sum + p.finalValue, 0);
  const totalWithoutDiscount = totalAmount;
  const originalDisplay = typeof originalAmount === "number" ? originalAmount : totalAmount;
  const totalSavings = totalWithoutDiscount - totalFinal;

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

        {/* Slider para ajustar porcentagem base de desconto */}
        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium text-foreground">
              Porcentagem base de desconto: <span className="text-primary font-bold">{baseDiscountPercent}%</span>
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={baseDiscountPercent}
              onChange={(e) => setBaseDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 text-center bg-background"
            />
          </div>
          <Slider
            value={[baseDiscountPercent]}
            onValueChange={(value) => setBaseDiscountPercent(value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Ajuste a porcentagem inicial. O desconto reduz progressivamente conforme o número de parcelas.
          </p>
        </div>

        {/* Opções de parcelas pré-definidas */}
        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
          <Label className="text-sm font-medium text-foreground mb-3 block">
            Escolha o número de parcelas:
          </Label>
          <div className="flex flex-wrap gap-2">
            {discountTable.map((tier) => (
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
                  value={plan.value.toFixed(2)}
                  onChange={(e) => updatePlan(index, "value", parseFloat(e.target.value) || 0)}
                  className="bg-background dark:bg-background/50"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Desconto (%)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
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

      {/* Resumo Detalhado */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20">
        <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Resumo Financeiro</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Principal</p>
            <p className="text-lg font-bold text-foreground">R$ {originalDisplay.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Juros</p>
            <p className="text-lg font-bold text-foreground">R$ {interestAmount.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Multa</p>
            <p className="text-lg font-bold text-foreground">R$ {penaltyAmount.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total s/ desc.</p>
            <p className="text-lg font-bold text-foreground">R$ {totalWithoutDiscount.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-primary/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total a pagar</p>
            <p className="text-lg font-bold text-primary">R$ {totalFinal.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Economia</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ {totalSavings.toFixed(2)}</p>
          </div>
        </div>

        {/* Resumo por parcela */}
        {plans.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Detalhes por parcela:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-2 text-left">Nº</th>
                    <th className="p-2 text-right">Valor Base</th>
                    <th className="p-2 text-right">Desconto</th>
                    <th className="p-2 text-right">Valor Final</th>
                    <th className="p-2 text-center">Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => {
                    const discountAmt = plan.value - plan.finalValue;
                    return (
                      <tr key={plan.installmentNumber} className="border-t border-border/30">
                        <td className="p-2 font-semibold">{plan.installmentNumber}</td>
                        <td className="p-2 text-right">R$ {plan.value.toFixed(2)}</td>
                        <td className="p-2 text-right text-emerald-600 dark:text-emerald-400">
                          {plan.discount}% (-R$ {discountAmt.toFixed(2)})
                        </td>
                        <td className="p-2 text-right font-semibold">R$ {plan.finalValue.toFixed(2)}</td>
                        <td className="p-2 text-center">{new Date(plan.dueDate).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Legenda de descontos */}
      <div className="mt-4 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Tabela de Descontos (base: {baseDiscountPercent}%):</p>
        <div className="flex flex-wrap gap-2">
          {discountTable.map((tier) => (
            <span 
              key={tier.maxInstallments} 
              className={`text-xs px-2 py-1 rounded ${tier.color} text-white`}
            >
              {tier.label}: {tier.discountPercent}%
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          * Descontos aplicados {applyToTotal ? "sobre o valor total" : "apenas sobre os juros"}
        </p>
      </div>
    </Card>
  );
};

export default InstallmentPlanner;