import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

export class QRCodeUtil {
  /**
   * Gera um código de acesso único
   */
  static gerarCodigoAcesso(prefixo: string, identificador: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = randomBytes(2).toString('hex').toUpperCase();
    const idClean = identificador.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    return `${prefixo}-${idClean}-${timestamp}-${random}`;
  }

  /**
   * Gera token único para links de convite
   */
  static gerarTokenLink(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Gera QR Code em base64
   */
  static async gerarQRCodeBase64(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error.message}`);
    }
  }

  /**
   * Gera QR Code como buffer PNG
   */
  static async gerarQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
      });
      return buffer;
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error.message}`);
    }
  }

  /**
   * Gera dados estruturados para QR Code de acesso
   */
  static gerarDadosQRCodeAcesso(dados: {
    codigo: string;
    tipo: 'morador' | 'visitante' | 'visitor';
    nome: string;
    condominioId: string;
    unidade?: string;
    validade?: Date;
  }): string {
    const payload = {
      codigo: dados.codigo,
      tipo: dados.tipo,
      nome: dados.nome,
      condominioId: dados.condominioId,
      unidade: dados.unidade,
      validade: dados.validade?.toISOString(),
      timestamp: Date.now(),
    };

    return JSON.stringify(payload);
  }

  /**
   * Valida formato de código de acesso
   */
  static validarFormatoCodigoAcesso(codigo: string): boolean {
    // Formato: PREFIXO-IDENTIFICADOR-TIMESTAMP-RANDOM
    const pattern = /^[A-Z]{3,}-[A-Z0-9]+-\d{6}-[A-Z0-9]{4}$/;
    return pattern.test(codigo);
  }
}
