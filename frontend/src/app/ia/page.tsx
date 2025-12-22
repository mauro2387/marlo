'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 🍪 Soy el asistente virtual de MarLo Cookies. ¿En qué puedo ayudarte?\n\nPodés preguntarme por:\n• Productos y precios\n• Zonas de delivery\n• Sistema de puntos\n• Horarios y ubicación',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Lo siento, hubo un error. ¿Podés intentar de nuevo?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un error de conexión. Por favor intentá de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatMessage = (content: string) => {
    let formatted = content;
    
    // Convertir **texto** a negrita
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convertir *texto* a cursiva
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Limpiar cualquier HTML malformado que venga de la IA
    formatted = formatted.replace(/" target="_blank"[^>]*>/g, '');
    formatted = formatted.replace(/<\/a>/g, '');
    formatted = formatted.replace(/class="[^"]*"/g, '');
    
    // Convertir URLs completas a links
    formatted = formatted.replace(
      /https?:\/\/[^\s<\)]+/g, 
      '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline font-medium">$&</a>'
    );
    
    // Convertir paths internos como /productos a links (pero no si ya están en un href)
    formatted = formatted.replace(
      /(?<!href=["'])(?<!\w)(\/(?:productos|boxes|puntos|carrito|pedidos|contacto|perfil)(?:\?[^\s<\)]*)?)/g,
      '<a href="$1" class="text-pink-600 hover:underline font-medium">$1</a>'
    );
    
    // Convertir listas con • o -
    formatted = formatted.replace(/^[•\-]\s+(.+)$/gm, '<li class="ml-4">$1</li>');
    
    // Convertir saltos de línea
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Limpiar <br> consecutivos
    formatted = formatted.replace(/(<br>){3,}/g, '<br><br>');
    
    return formatted;
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '¡Hola! 🍪 Soy el asistente virtual de MarLo Cookies. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍪</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">MarLo Cookies</h1>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Asistente Virtual
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Limpiar chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          {/* Messages */}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-pink-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            '¿Qué productos tienen?',
            '¿Hacen delivery?',
            '¿Cuáles son los horarios?',
            '¿Cómo funcionan los puntos?',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setInput(suggestion);
                inputRef.current?.focus();
              }}
              className="px-3 py-1.5 bg-white border border-pink-200 text-pink-600 rounded-full text-sm hover:bg-pink-50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Asistente Virtual de MarLo Cookies • Punta del Este
        </p>
      </main>
    </div>
  );
}
