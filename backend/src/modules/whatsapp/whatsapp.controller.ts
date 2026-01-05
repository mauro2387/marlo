import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Webhook GET - Verificación de Meta
   * Meta llama este endpoint para verificar tu webhook
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    this.logger.log('📞 Solicitud de verificación de webhook recibida');
    
    const result = this.whatsappService.verifyWebhook(mode, token, challenge);
    
    if (result) {
      return parseInt(result);
    }
    
    return 'Forbidden';
  }

  /**
   * Webhook POST - Recibe mensajes de WhatsApp
   * Meta envía los mensajes entrantes a este endpoint
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async receiveMessage(@Body() body: any) {
    try {
      this.logger.log('📨 Webhook recibido de Meta');

      // Validar estructura del mensaje
      if (body.object !== 'whatsapp_business_account') {
        return { status: 'ignored' };
      }

      // Procesar cada entrada
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Validar que tenga mensajes
          if (!value?.messages) {
            continue;
          }

          // Procesar cada mensaje
          for (const message of value.messages) {
            // Solo procesar mensajes de texto
            if (message.type === 'text') {
              const from = message.from;
              const messageBody = message.text.body;
              const senderName = value.contacts?.[0]?.profile?.name || 'Cliente';

              // Procesar mensaje de forma asíncrona (no bloquear la respuesta)
              this.whatsappService
                .processIncomingMessage(from, messageBody, senderName)
                .catch(error => {
                  this.logger.error(`Error procesando mensaje: ${error.message}`);
                });
            }
          }
        }
      }

      // Siempre responder 200 OK inmediatamente a Meta
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error en webhook: ${error.message}`);
      // Aún así responder 200 para no reintentos de Meta
      return { status: 'error' };
    }
  }

  /**
   * Endpoint manual para enviar mensajes (solo para testing/admin)
   */
  @Post('send')
  async sendMessage(
    @Body() body: { to: string; message: string },
  ) {
    await this.whatsappService.sendMessage(body.to, body.message);
    return { success: true, message: 'Mensaje enviado' };
  }
}
