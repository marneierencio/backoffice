type ViaCepResponse = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export type CepData = {
  logradouro: string;
  bairro: string;
  municipio: string;
  estado: string;
};

export const lookupCep = async (cep: string): Promise<CepData | null> => {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;

    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      municipio: data.localidade || '',
      estado: data.uf || '',
    };
  } catch {
    return null;
  }
};
