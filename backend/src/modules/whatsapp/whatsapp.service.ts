import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly openai: OpenAI;
  private readonly whatsappApiUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    this.whatsappApiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  /**
   * Procesa mensaje entrante de WhatsApp y genera respuesta con IA
   */
  async processIncomingMessage(from: string, messageBody: string, senderName: string): Promise<void> {
    try {
      this.logger.log(`📨 Mensaje recibido de ${senderName} (${from}): ${messageBody}`);

      // Generar respuesta con IA
      const aiResponse = await this.generateAIResponse(messageBody, senderName);

      // Enviar respuesta por WhatsApp
      await this.sendMessage(from, aiResponse);

      this.logger.log(`✅ Respuesta enviada a ${from}`);
    } catch (error) {
      this.logger.error(`❌ Error procesando mensaje: ${error.message}`);
      // Enviar mensaje de error al usuario
      await this.sendMessage(from, 'Disculpa, tuve un problema procesando tu mensaje. Un agente te contactará pronto. 🙏');
    }
  }

  /**
   * Genera respuesta usando OpenAI con contexto de Marlo Cookies
   */
  private async generateAIResponse(message: string, userName: string): Promise<string> {
    const systemPrompt = `Eres el asistente virtual de MarLo Cookies, una tienda online de cookies artesanales en Uruguay.

INFORMACIÓN DE LA TIENDA:
- Productos: Cookies artesanales, boxes personalizados, ediciones limitadas
- Horarios: Lunes a Viernes 9:00-18:00, Sábados 10:00-14:00
- Delivery disponible en Montevideo
- Métodos de pago: Efectivo, transferencia, MercadoPago
- Programa de puntos: Los clientes ganan puntos por cada compra
- Teléfono: +598 XXXXXXXX (actualizar con el real)
- Email: info@marlocookies.com (actualizar con el real)

TU ROL:
- Responde de forma amigable, cálida y profesional
- Usa emojis con moderación 🍪
- Máximo 2-3 líneas por respuesta
- Si preguntan por productos específicos, menciona que pueden ver el catálogo completo en la web
- Para pedidos, pídeles que completen la orden en la web o toma sus datos
- Si no sabes algo, ofrece derivar a un agente humano

TONO: Cercano, amigable, como un amigo que trabaja en la tienda`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `El cliente ${userName} dice: "${message}"` },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || 'Hola! ¿En qué puedo ayudarte? 🍪';
  }

  /**
   * Envía mensaje de WhatsApp usando la API de Meta
   */
  async sendMessage(to: string, message: string): Promise<void> {
    try {
      await axios.post(
        this.whatsappApiUrl,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      this.logger.error(`Error enviando mensaje: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envía mensaje con botones interactivos
   */
  async sendInteractiveMessage(to: string, bodyText: string, buttons: Array<{ id: string; title: string }>): Promise<void> {
    try {
      await axios.post(
        this.whatsappApiUrl,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map(btn => ({
                type: 'reply',
                reply: { id: btn.id, title: btn.title },
              })),
            },
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      this.logger.error(`Error enviando mensaje interactivo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica el webhook de Meta (requisito para configuración)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado correctamente');
      return challenge;
    }
    
    this.logger.warn('❌ Verificación de webhook fallida');
    return null;
  }
}
