import { PORTAL_CLIENTE_CONSTANTS } from '../constants/portal-cliente.constants';

export class ValidationUtil {
  /**
   * Valida CPF brasileiro
   */
  static validarCPF(cpf: string): boolean {
    // Remove caracteres especiais
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;

    if (parseInt(cpfLimpo.charAt(9)) !== digito1) {
      return false;
    }

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    return parseInt(cpfLimpo.charAt(10)) === digito2;
  }

  /**
   * Valida CNPJ brasileiro
   */
  static validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }

    // Validação dos dígitos verificadores
    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
      return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }

  /**
   * Valida placa de veículo (formato antigo ou Mercosul)
   */
  static validarPlaca(placa: string): boolean {
    const placaUpper = placa.toUpperCase();
    return (
      PORTAL_CLIENTE_CONSTANTS.PATTERNS.PLACA_ANTIGA.test(placaUpper) ||
      PORTAL_CLIENTE_CONSTANTS.PATTERNS.PLACA_MERCOSUL.test(placaUpper)
    );
  }

  /**
   * Valida formato de telefone brasileiro
   */
  static validarTelefone(telefone: string): boolean {
    return PORTAL_CLIENTE_CONSTANTS.PATTERNS.TELEFONE.test(telefone);
  }

  /**
   * Formata CPF
   */
  static formatarCPF(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ
   */
  static formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }

  /**
   * Formata placa de veículo
   */
  static formatarPlaca(placa: string): string {
    const placaLimpa = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Formato Mercosul: ABC1D23
    if (placaLimpa.length === 7 && /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placaLimpa)) {
      return placaLimpa;
    }
    
    // Formato antigo: ABC-1234
    if (placaLimpa.length === 7) {
      return `${placaLimpa.substring(0, 3)}-${placaLimpa.substring(3)}`;
    }
    
    return placaLimpa;
  }

  /**
   * Remove caracteres especiais de documentos
   */
  static limparDocumento(documento: string): string {
    return documento.replace(/\D/g, '');
  }

  /**
   * Valida se data não é no passado
   */
  static validarDataFutura(data: Date): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparacao = new Date(data);
    dataComparacao.setHours(0, 0, 0, 0);
    return dataComparacao >= hoje;
  }

  /**
   * Valida ano de veículo
   */
  static validarAnoVeiculo(ano: number): boolean {
    const anoAtual = new Date().getFullYear();
    return ano >= 1900 && ano <= anoAtual + 1;
  }
}
