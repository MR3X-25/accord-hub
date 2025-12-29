import { AgreementData, InstallmentPlan } from "./storage";

export interface AgreementCalculation {
  principal: number;
  interestRate: number;
  penaltyRate: number;
  interestAmount: number;
  penaltyAmount: number;
  totalWithCharges: number;
  discount: number;
  discountAmount: number;
  totalFinal: number;
  savings: number;
}

export interface InstallmentSummary {
  installmentNumber: number;
  baseValue: number;
  discountPercent: number;
  discountAmount: number;
  finalValue: number;
  dueDate: string;
}

export interface PaymentSummary {
  method: string;
  methodLabel: string;
  installments: number;
  calculation: AgreementCalculation;
  installmentDetails: InstallmentSummary[];
}

/**
 * Calcula os valores do acordo de forma consistente
 */
export const calculateAgreementValues = (agreement: AgreementData): AgreementCalculation => {
  const principal = parseFloat(String(agreement.principalAmount ?? "0")) || 0;
  const interestRate = parseFloat(String(agreement.interestRate ?? "0")) || 0;
  const penaltyRate = parseFloat(String(agreement.penaltyRate ?? "0")) || 0;

  const interestAmount = (principal * interestRate) / 100;
  const penaltyAmount = (principal * penaltyRate) / 100;
  const totalWithCharges = principal + interestAmount + penaltyAmount;

  // Se há planos de parcelas, calcular desconto e total final
  let discount = 0;
  let discountAmount = 0;
  let totalFinal = totalWithCharges;

  if (agreement.installmentPlans && agreement.installmentPlans.length > 0) {
    totalFinal = agreement.installmentPlans.reduce((sum, p) => sum + (p.finalValue || 0), 0);
    discountAmount = totalWithCharges - totalFinal;
    discount = totalWithCharges > 0 ? (discountAmount / totalWithCharges) * 100 : 0;
  }

  const savings = totalWithCharges - totalFinal;

  return {
    principal,
    interestRate,
    penaltyRate,
    interestAmount,
    penaltyAmount,
    totalWithCharges,
    discount,
    discountAmount,
    totalFinal,
    savings,
  };
};

/**
 * Gera resumo detalhado das parcelas
 */
export const getInstallmentSummary = (plans: InstallmentPlan[]): InstallmentSummary[] => {
  return plans.map((plan) => ({
    installmentNumber: plan.installmentNumber,
    baseValue: plan.value,
    discountPercent: plan.discount,
    discountAmount: plan.value - plan.finalValue,
    finalValue: plan.finalValue,
    dueDate: plan.dueDate,
  }));
};

/**
 * Gera resumo completo de pagamento
 */
export const getPaymentSummary = (agreement: AgreementData): PaymentSummary | null => {
  if (!agreement.installmentPlans || agreement.installmentPlans.length === 0) {
    return null;
  }

  const calculation = calculateAgreementValues(agreement);
  const installmentDetails = getInstallmentSummary(agreement.installmentPlans);

  // Pega o método de pagamento selecionado
  const selectedOption = agreement.paymentOptions?.[0];
  const methodLabels: Record<string, string> = {
    pix: "PIX",
    boleto: "Boleto Bancário",
    card: "Cartão de Crédito",
    link: "Link de Pagamento",
  };

  return {
    method: selectedOption?.method || "pix",
    methodLabel: methodLabels[selectedOption?.method || "pix"] || "PIX",
    installments: agreement.installmentPlans.length,
    calculation,
    installmentDetails,
  };
};

/**
 * Formata valor em reais
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
};
