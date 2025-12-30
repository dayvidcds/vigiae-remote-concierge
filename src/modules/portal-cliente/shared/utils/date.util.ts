export class DateUtil {
  /**
   * Adiciona horas a uma data
   */
  static adicionarHoras(data: Date, horas: number): Date {
    const novaData = new Date(data);
    novaData.setHours(novaData.getHours() + horas);
    return novaData;
  }

  /**
   * Adiciona dias a uma data
   */
  static adicionarDias(data: Date, dias: number): Date {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  /**
   * Verifica se data1 é maior que data2
   */
  static isMaiorQue(data1: Date, data2: Date): boolean {
    return new Date(data1).getTime() > new Date(data2).getTime();
  }

  /**
   * Verifica se data1 é menor que data2
   */
  static isMenorQue(data1: Date, data2: Date): boolean {
    return new Date(data1).getTime() < new Date(data2).getTime();
  }

  /**
   * Verifica se data está entre data1 e data2
   */
  static isEntre(data: Date, inicio: Date, fim: Date): boolean {
    const dataTime = new Date(data).getTime();
    return dataTime >= new Date(inicio).getTime() && dataTime <= new Date(fim).getTime();
  }

  /**
   * Retorna início do dia (00:00:00)
   */
  static inicioDoDia(data: Date = new Date()): Date {
    const novaData = new Date(data);
    novaData.setHours(0, 0, 0, 0);
    return novaData;
  }

  /**
   * Retorna fim do dia (23:59:59)
   */
  static fimDoDia(data: Date = new Date()): Date {
    const novaData = new Date(data);
    novaData.setHours(23, 59, 59, 999);
    return novaData;
  }

  /**
   * Retorna início do mês
   */
  static inicioDoMes(data: Date = new Date()): Date {
    const novaData = new Date(data);
    novaData.setDate(1);
    novaData.setHours(0, 0, 0, 0);
    return novaData;
  }

  /**
   * Retorna fim do mês
   */
  static fimDoMes(data: Date = new Date()): Date {
    const novaData = new Date(data);
    novaData.setMonth(novaData.getMonth() + 1);
    novaData.setDate(0);
    novaData.setHours(23, 59, 59, 999);
    return novaData;
  }

  /**
   * Formata data para string legível (DD/MM/YYYY HH:mm)
   */
  static formatarDataHora(data: Date): string {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }

  /**
   * Formata data para string (DD/MM/YYYY)
   */
  static formatarData(data: Date): string {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * Calcula diferença em dias entre duas datas
   */
  static diferencaEmDias(data1: Date, data2: Date): number {
    const umDia = 1000 * 60 * 60 * 24;
    const diferenca = new Date(data2).getTime() - new Date(data1).getTime();
    return Math.floor(diferenca / umDia);
  }

  /**
   * Verifica se data já expirou
   */
  static isExpirado(data: Date): boolean {
    return new Date(data).getTime() < Date.now();
  }
}
