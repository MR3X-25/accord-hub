// Gera token único de acordo no formato MR3X-ACD-YYYY-XXXXXX
export const generateAgreementToken = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MR3X-ACD-${year}-${random}`;
};

// Valida formato de token de contrato MR3X-CTR-YYYY-XXXXXX
export const validateContractToken = (token: string): { valid: boolean; message?: string } => {
  if (!token) {
    return { valid: false, message: "Token do contrato é obrigatório" };
  }

  const pattern = /^MR3X-CTR-(\d{4})-\d+$/;
  const match = token.match(pattern);

  if (!match) {
    return {
      valid: false,
      message: 'Formato inválido. Use: MR3X-CTR-[ANO]-[NÚMERO]'
    };
  }

  const tokenYear = parseInt(match[1]);
  const currentYear = new Date().getFullYear();

  if (tokenYear > currentYear) {
    return {
      valid: false,
      message: `Ano do token (${tokenYear}) não pode ser maior que o ano atual (${currentYear})`
    };
  }

  return { valid: true };
};

// Formata token de contrato (adiciona traços se necessário)
export const formatContractToken = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
};
