import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para el servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configuración de OpenAI (o podés usar Anthropic/Claude)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Información base de MarLo Cookies
const MARLO_INFO = `
Sos el asistente virtual OFICIAL de MarLo Cookies, una tienda de cookies artesanales en Punta del Este, Uruguay.

⚠️ REGLA CRÍTICA - FILTRO DE TEMAS:
SOLO podés responder sobre temas relacionados con MarLo Cookies:
- Productos (cookies, boxes, bebidas)
- Precios y ofertas
- Pedidos y carrito
- Delivery y envíos
- Sistema de puntos y recompensas
- Horarios y ubicación
- Métodos de pago
- Consultas generales sobre la tienda

Si el usuario pregunta sobre CUALQUIER otro tema (política, ciencia, matemáticas, programación, otras marcas, consejos personales, recetas, historia, geografía, etc.), SIEMPRE respondé:
"🍪 ¡Hola! Soy el asistente de MarLo Cookies y solo puedo ayudarte con temas relacionados con nuestra tienda. ¿Te gustaría saber sobre nuestros productos, delivery, puntos o algo más de MarLo?"

NUNCA respondas preguntas sobre:
- Ciencia (mitocondrias, física, química, biología, etc.)
- Matemáticas o cálculos no relacionados con precios
- Programación o tecnología
- Historia, geografía, política
- Otras marcas o empresas
- Consejos personales, salud, relaciones
- Cualquier tema que NO sea MarLo Cookies

INFORMACIÓN DEL NEGOCIO:
- Nombre: MarLo Cookies
- Ubicación: Av. Juan Gorlero casi 25, Punta del Este, Maldonado, Uruguay
- Horarios: Miércoles a Lunes de 15:00 a 20:00. Martes cerrado.
- Teléfono/WhatsApp: (+598) 97 865 053
- Email: marlocookies2@gmail.com
- Instagram: @marlocookies

ENVÍOS:
- Zonas: Punta del Este, Maldonado, San Carlos, La Barra, Manantiales
- Delivery en toda la zona
- Costo de envío: varía según zona ($80-$150)
- También tienen retiro en local

SISTEMA DE PUNTOS:
- Ganan 1 punto por cada $1 de compra
- Pueden canjear puntos por productos gratis o descuentos
- Recompensas disponibles: Café + Cookie (2000 pts), Box x4 (5000 pts), Box x6 (10000 pts), etc.

MÉTODOS DE PAGO:
- Efectivo contra entrega
- Transferencia bancaria
- MercadoPago (tiene 10% de recargo)

TU PERSONALIDAD:
- Sos amable, cercano y entusiasta
- Usás emojis moderadamente 🍪
- Hablás en español rioplatense (vos, tenés, querés)
- Sos conciso pero informativo
- Si no sabés algo específico de MarLo, decí que pueden contactar por WhatsApp

REGLAS DE RESPUESTA:
- Siempre saludá si es el primer mensaje
- Ofrecé ayuda específica sobre MarLo
- Si preguntan por un producto, da precio y descripción
- Para recomendar productos, usá el link: /productos?id=ID_DEL_PRODUCTO
- NUNCA generes HTML ni código, solo texto plano
- Usá **texto** para negritas (dos asteriscos)
- Para listas usá guiones: - item
- No inventes información, usá solo los datos que te paso
- Mantené las respuestas cortas y claras
- SIEMPRE mantené el contexto de la conversación - si el usuario pregunta "¿cuál me recomendás?" después de preguntar por cookies, respondé basándote en los productos que mencionaste

CONTEXTO CONVERSACIONAL:
- Recordá lo que el usuario preguntó antes
- Si dice "cuál", "esa", "eso", "la primera", etc., referite al contexto anterior
- Si pregunta por recomendaciones después de ver productos, recomendá basándote en lo anterior
`;

// Detectar si el mensaje es sobre un tema no permitido
function isOffTopic(message: string): boolean {
  const msg = message.toLowerCase();
  
  // Palabras clave de temas NO permitidos
  const offTopicKeywords = [
    // Ciencia
    'mitocondria', 'célula', 'adn', 'átomo', 'molécula', 'fotosíntesis', 'evolución',
    'física', 'química', 'biología', 'ciencia', 'científico', 'experimento',
    'planeta', 'galaxia', 'universo', 'astronomía', 'nasa', 'einstein',
    // Matemáticas
    'ecuación', 'derivada', 'integral', 'teorema', 'pitágoras', 'álgebra',
    'trigonometría', 'logaritmo', 'factorial', 'raíz cuadrada',
    // Programación
    'código', 'programar', 'javascript', 'python', 'html', 'css', 'react',
    'función', 'variable', 'algoritmo', 'base de datos', 'api',
    // Historia/Geografía
    'guerra mundial', 'revolución', 'imperio', 'rey', 'reina', 'presidente',
    'capital de', 'país', 'continente', 'historia de', 'cuando fue',
    // Política
    'político', 'elecciones', 'gobierno', 'partido', 'votar', 'democracia',
    // Salud/Personal
    'enfermedad', 'síntoma', 'medicina', 'doctor', 'hospital', 'dieta',
    'ejercicio', 'gym', 'psicología', 'depresión', 'ansiedad',
    // Otros
    'receta de', 'cómo hacer', 'cómo cocinar', 'ingredientes para',
    'película', 'serie', 'netflix', 'spotify', 'youtube', 'juego', 'videojuego',
    'futbol', 'fútbol', 'mundial', 'champions', 'messi', 'ronaldo',
    'bitcoin', 'crypto', 'inversión', 'acciones', 'bolsa',
    'amazon', 'google', 'apple', 'microsoft', 'facebook', 'instagram de',
    'qué opinas de', 'qué piensas de', 'cuál es tu opinión',
    'cuéntame sobre', 'háblame de', 'explícame',
  ];
  
  // Si el mensaje contiene alguna palabra clave off-topic Y NO menciona marlo/cookies/producto
  const marloKeywords = [
    'marlo', 'cookie', 'galleta', 'box', 'pedido', 'envío', 'delivery',
    'punto', 'puntos', 'precio', 'cuesta', 'vale', 'pago', 'pagar',
    'horario', 'abierto', 'cerrado', 'ubicación', 'dirección', 'local',
    'sabor', 'chocolate', 'oreo', 'velvet', 'limitad', 'producto',
    'carrito', 'compra', 'tienda', 'bebida', 'agua', 'coca', 'refresco',
    'cupón', 'descuento', 'oferta', 'promoción', 'whatsapp', 'contacto',
    'recomendar', 'recomendás', 'cuál', 'cuáles', 'cual', 'mejor',
    'favorit', 'popular', 'nuevo', 'probar', 'rico', 'delicio',
  ];
  
  const hasOffTopic = offTopicKeywords.some(keyword => msg.includes(keyword));
  const hasMarlo = marloKeywords.some(keyword => msg.includes(keyword));
  
  // Es off-topic si tiene palabras prohibidas Y no menciona nada de MarLo
  return hasOffTopic && !hasMarlo;
}

// Obtener datos actualizados de la base de datos
async function getMarloContext() {
  let context = MARLO_INFO;

  try {
    // Obtener productos disponibles
    const { data: products } = await supabase
      .from('products')
      .select('id, nombre, descripcion, precio, categoria, stock, es_limitado, ingredientes')
      .eq('activo', true)
      .gt('stock', 0)
      .order('categoria')
      .order('nombre');

    if (products && products.length > 0) {
      context += `\n\nPRODUCTOS DISPONIBLES (${products.length} productos):\n`;
      context += `IMPORTANTE: Para recomendar un producto específico, incluí el link así: /productos?id=ID_DEL_PRODUCTO\n`;
      
      const categorias: Record<string, any[]> = {};
      products.forEach(p => {
        const cat = p.categoria || 'otros';
        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(p);
      });

      for (const [cat, prods] of Object.entries(categorias)) {
        context += `\n${cat.toUpperCase()}:\n`;
        prods.forEach(p => {
          context += `- **${p.nombre}**: $${p.precio}`;
          if (p.es_limitado) context += ' ⭐ EDICIÓN LIMITADA';
          if (p.descripcion) context += ` - ${p.descripcion}`;
          context += `\n  Link: /productos?id=${p.id}\n`;
        });
      }
    }

    // Obtener cupones activos
    const { data: coupons } = await supabase
      .from('coupons')
      .select('code, tipo, valor, descripcion')
      .eq('activo', true);

    if (coupons && coupons.length > 0) {
      context += `\n\nCUPONES ACTIVOS:\n`;
      coupons.forEach(c => {
        const descuento = c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor}`;
        context += `- **${c.code}**: ${descuento} de descuento`;
        if (c.descripcion) context += ` (${c.descripcion})`;
        context += `\n`;
      });
    }

    // Obtener zonas de delivery
    const { data: zones } = await supabase
      .from('delivery_zones')
      .select('name, cost, estimated_time, available')
      .eq('available', true)
      .order('order_priority');

    if (zones && zones.length > 0) {
      context += `\n\nZONAS DE DELIVERY:\n`;
      zones.forEach(z => {
        context += `- ${z.name}: $${z.cost} (${z.estimated_time})\n`;
      });
    }

  } catch (error) {
    console.error('Error obteniendo contexto:', error);
  }

  context += `\n\nLINKS ÚTILES (usar solo el path, sin dominio):
- Ver todos los productos: /productos
- Armar box personalizado: /boxes
- Ver mis puntos: /puntos
- Mi carrito: /carrito
- Mis pedidos: /pedidos
- Contacto: /contacto
- WhatsApp directo: https://wa.me/59897865053

RECORDÁ: Cuando recomiendes un producto específico, incluí siempre el link con el formato /productos?id=ID
`;

  return context;
}

// Generar respuesta con IA
async function generateResponse(messages: any[], context: string): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Verificar si el mensaje es off-topic (solo si hay más de 1 mensaje, para permitir contexto)
  if (messages.length === 1 && isOffTopic(lastMessage)) {
    return '🍪 ¡Hola! Soy el asistente de MarLo Cookies y solo puedo ayudarte con temas relacionados con nuestra tienda.\n\n¿Te gustaría saber sobre:\n- Nuestros productos y precios\n- Zonas de delivery\n- Sistema de puntos\n- Horarios y ubicación\n\n¡Preguntame lo que quieras sobre MarLo! 🍪';
  }
  
  // Si no hay API key de OpenAI, usar respuestas básicas
  if (!OPENAI_API_KEY) {
    return generateBasicResponse(lastMessage, context);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modelo económico y rápido
        messages: [
          { role: 'system', content: context },
          ...messages.slice(-15), // Últimos 15 mensajes para mejor contexto
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Error en OpenAI API');
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje. ¿Podés intentar de nuevo?';
    
    // Verificar si la IA respondió algo off-topic a pesar del prompt
    const offTopicIndicators = [
      'como modelo de lenguaje', 'no puedo opinar', 'no tengo opiniones',
      'según la ciencia', 'históricamente', 'en términos científicos',
      'la mitocondria es', 'las células', 'en física', 'matemáticamente',
    ];
    
    if (offTopicIndicators.some(ind => aiResponse.toLowerCase().includes(ind))) {
      return '🍪 ¡Uy! Eso está fuera de mi área. Soy el asistente de MarLo Cookies y solo puedo ayudarte con nuestra tienda.\n\n¿Querés que te cuente sobre nuestras cookies, delivery o sistema de puntos?';
    }
    
    return aiResponse;

  } catch (error) {
    console.error('Error con OpenAI:', error);
    return generateBasicResponse(lastMessage, context);
  }
}

// Respuestas básicas sin IA (fallback)
function generateBasicResponse(message: string, context: string): string {
  const msg = message.toLowerCase();

  // Verificar off-topic primero
  if (isOffTopic(message)) {
    return '🍪 ¡Hola! Soy el asistente de MarLo Cookies y solo puedo ayudarte con temas relacionados con nuestra tienda.\n\n¿Te gustaría saber sobre:\n- Nuestros productos y precios\n- Zonas de delivery\n- Sistema de puntos\n- Horarios y ubicación\n\n¡Preguntame lo que quieras sobre MarLo! 🍪';
  }

  // Saludos
  if (msg.match(/^(hola|buenas|hey|hi|ey|que tal|buenos días|buenas tardes|buenas noches)/)) {
    return '¡Hola! 🍪 Bienvenido a MarLo Cookies. ¿En qué puedo ayudarte?\n\nPodés preguntarme por:\n- Nuestros productos y precios\n- Zonas de delivery\n- Sistema de puntos\n- Horarios y ubicación';
  }

  // Productos
  if (msg.match(/(productos|cookies|catalogo|catálogo|menu|menú|que tienen|qué tienen|sabores)/)) {
    return '🍪 ¡Tenemos muchas opciones deliciosas!\n\nAlgunas de nuestras cookies más populares:\n- **Chocolate Chunk**: La clásica con chips de chocolate\n- **Oreo**: Con trozos de Oreo\n- **Red Velvet**: Suave y con cream cheese\n\nMirá todo el catálogo acá:\n👉 /productos\n\nO armá tu propio box:\n👉 /boxes\n\n¿Buscás algún sabor en particular?';
  }

  // Recomendaciones
  if (msg.match(/(recomendar|recomendás|recomendas|cuál me|cual me|mejor|favorit|popular)/)) {
    return '🍪 ¡Te recomiendo probar nuestras más pedidas!\n\n⭐ **Top 3 favoritas:**\n- Chocolate Chunk - La clásica\n- Oreo - Para los fans de Oreo\n- Red Velvet - Suave y especial\n\nSi querés algo diferente, fijate en nuestras **ediciones limitadas** que cambian cada mes.\n\n👉 /productos\n\n¿Querés que te cuente de alguna en particular?';
  }

  // Precios
  if (msg.match(/(precio|cuanto|cuánto|cuesta|vale)/)) {
    return '💰 Nuestros precios:\n\n- Cookies individuales: desde $150\n- **Box x4**: $540\n- **Box x6**: $800\n- **Box x9**: $1200\n\nMirá todos los productos en /productos 🍪';
  }

  // Delivery/Envío
  if (msg.match(/(envio|envío|delivery|llevan|traen|domicilio|zona)/)) {
    return '🚚 ¡Sí, hacemos delivery!\n\nZonas: Punta del Este, Maldonado, San Carlos, La Barra, Manantiales\n\n¿A qué zona necesitás?';
  }

  // Horarios
  if (msg.match(/(horario|hora|abierto|abren|cierran|atienden)/)) {
    return '🕐 Nuestros horarios:\n\n**Miércoles a Lunes**: 15:00 - 20:00\n**Martes**: Cerrado\n\n📍 Av. Juan Gorlero casi 25, Punta del Este';
  }

  // Puntos
  if (msg.match(/(punto|puntos|programa|beneficio|canjear|recompensa)/)) {
    return '⭐ ¡Tenemos programa de puntos!\n\n- Ganás **1 punto por cada $1**\n- Canjeá por productos gratis o descuentos\n\nMirá tus puntos en /puntos\n\n¿Querés saber las recompensas disponibles?';
  }

  // Ubicación
  if (msg.match(/(donde|dónde|ubicación|ubicacion|dirección|direccion|local|tienda)/)) {
    return '📍 Estamos en:\n\n**Av. Juan Gorlero casi 25**\nPunta del Este, Maldonado\n\n🕐 Miércoles a Lunes 15:00-20:00\n\n¿Necesitás indicaciones?';
  }

  // Pago
  if (msg.match(/(pago|pagar|tarjeta|efectivo|transferencia|mercadopago)/)) {
    return '💳 Métodos de pago:\n\n- Efectivo contra entrega\n- Transferencia bancaria\n- MercadoPago (+10% recargo)\n\n¿Alguna otra consulta?';
  }

  // Contacto
  if (msg.match(/(contacto|contactar|llamar|whatsapp|hablar|humano|persona)/)) {
    return '📱 ¡Claro! Podés contactarnos:\n\n- **WhatsApp**: (+598) 97 865 053\n- **Email**: marlocookies2@gmail.com\n- **Instagram**: @marlocookies\n\n👉 https://wa.me/59897865053';
  }

  // Cupones/Descuentos
  if (msg.match(/(cupón|cupon|descuento|código|codigo|oferta|promoción|promocion)/)) {
    return '🎟️ ¡Tenemos cupones!\n\nPodés aplicar tu código en el carrito antes de pagar.\n\nSeguinos en Instagram **@marlocookies** para enterarte de las promos 🍪';
  }

  // Gracias
  if (msg.match(/(gracias|gracia|thank|genial|perfecto|excelente)/)) {
    return '¡De nada! 🍪 Cualquier otra consulta, acá estoy. ¡Que disfrutes tus cookies!';
  }

  // Despedida
  if (msg.match(/(chau|adios|adiós|bye|hasta luego|nos vemos)/)) {
    return '¡Chau! 👋 ¡Gracias por escribirnos! Esperamos verte pronto 🍪';
  }

  // Default - Solo sobre MarLo
  return '🍪 ¡Con gusto te ayudo! Podés preguntarme sobre:\n\n- **Productos y precios**\n- **Delivery y zonas**\n- **Horarios y ubicación**\n- **Sistema de puntos**\n- **Métodos de pago**\n\nO visitá nuestra tienda en /productos 🍪';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Se requiere un array de mensajes' },
        { status: 400 }
      );
    }

    // Obtener contexto actualizado de la base de datos
    const context = await getMarloContext();

    // Generar respuesta
    const response = await generateResponse(messages, context);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en chat API:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje' },
      { status: 500 }
    );
  }
}
