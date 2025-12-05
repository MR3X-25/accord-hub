// Gera token único de acordo no formato MR3X-ACD-YYYY-XXXXXX
export const generateAgreementToken = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MR3X-ACD-${year}-${random}`;
};

// Valida formato de token de contrato - aceita qualquer formato com pelo menos 3 caracteres
export const validateContractToken = (token: string): { valid: boolean; message?: string } => {
  if (!token || token.trim().length < 3) {
    return { valid: false, message: "Número do contrato é obrigatório (mínimo 3 caracteres)" };
  }

  return { valid: true };
};

// Formata token de contrato - permite alfanuméricos, traços e underscores
export const formatContractToken = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9\-_]/g, "");
};
