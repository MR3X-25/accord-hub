import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calendar } from "lucide-react";
import { InstallmentPlan } from "@/lib/storage";

interface InstallmentPlannerProps {
  totalAmount: number;
  onPlansChange: (plans: InstallmentPlan[]) => void;
}

const InstallmentPlanner = ({ totalAmount, onPlansChange }: InstallmentPlannerProps) => {
  const [plans, setPlans] = useState<InstallmentPlan[]>([
    {
      installmentNumber: 1,
      value: totalAmount,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0],
      discount: 0,
      finalValue: totalAmount,
    },
  ]);

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
      updatedPlans[index].finalValue = baseValue - (baseValue * discount / 100);
    }

    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const distributeEqually = () => {
    const valuePerInstallment = totalAmount / plans.length;
    const updatedPlans = plans.map((p, i) => ({
      ...p,
      value: valuePerInstallment,
      finalValue: valuePerInstallment - (valuePerInstallment * p.discount / 100),
    }));
    setPlans(updatedPlans);
    onPlansChange(updatedPlans);
  };

  const totalFinal = plans.reduce((sum, p) => sum + p.finalValue, 0);

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Planejamento de Parcelas</h3>
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
          <div key={index} className="p-4 border rounded-lg bg-background/50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-foreground">Parcela {plan.installmentNumber}</h4>
              {plans.length > 1 && (
                <Button onClick={() => removePlan(index)} variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={plan.value}
                  onChange={(e) => updatePlan(index, "value", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={plan.discount}
                  onChange={(e) => updatePlan(index, "discount", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Vencimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={plan.dueDate}
                    onChange={(e) => updatePlan(index, "dueDate", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Valor Final (R$)</Label>
                <Input value={plan.finalValue.toFixed(2)} disabled className="bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Original</p>
            <p className="text-lg font-bold text-foreground">R$ {totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total com Descontos</p>
            <p className="text-lg font-bold text-primary">R$ {totalFinal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Economia</p>
            <p className="text-lg font-bold text-green-500">R$ {(totalAmount - totalFinal).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstallmentPlanner;
