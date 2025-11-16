export interface PaymentOption {
  id: string;
  method: "pix" | "boleto" | "card" | "link";
  installments: number;
  installmentValue: number;
  totalValue: number;
  discount: number;
  dueDate?: string;
}

export interface InstallmentPlan {
  installmentNumber: number;
  value: number;
  dueDate: string;
  discount: number;
  finalValue: number;
}

export interface AgreementData {
  id: string;
  createdAt: string;
  updatedAt: string;
  agencyName: string;
  agencyAddress: string;
  agencyCnpj: string;
  brokerName: string;
  brokerCreci: string;
  creditorName: string;
  creditorCpfCnpj: string;
  creditorEmail?: string;
  debtorName: string;
  debtorCpfCnpj: string;
  debtorEmail?: string;
  contractId: string;
  propertyAddress: string;
  propertyCep?: string;
  propertyCity?: string;
  propertyState?: string;
  debtPeriod: string;
  principalAmount: string;
  interestRate: string;
  penaltyRate: string;
  calculatedTotal: number;
  paymentOptions: PaymentOption[];
  installmentPlans?: InstallmentPlan[];
  status: "draft" | "sent" | "signed" | "paid";
  hash?: string;
  ip?: string;
  signedAt?: string;
  signedBy?: string;
  tenantAcceptedOption?: string;
}

const STORAGE_KEY = "mr3x_agreements";

export const saveAgreement = (agreement: AgreementData): void => {
  const agreements = getAgreements();
  const index = agreements.findIndex((a) => a.id === agreement.id);
  
  if (index >= 0) {
    agreements[index] = { ...agreement, updatedAt: new Date().toISOString() };
  } else {
    agreements.push(agreement);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements));
};

export const getAgreements = (): AgreementData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getAgreementById = (id: string): AgreementData | null => {
  const agreements = getAgreements();
  return agreements.find((a) => a.id === id) || null;
};

export const deleteAgreement = (id: string): void => {
  const agreements = getAgreements().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements));
};

export const generateHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return "0.0.0.0";
  }
};
