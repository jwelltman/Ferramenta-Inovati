import { GoogleGenAI, Type } from "@google/genai";
import { Technician } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO: API_KEY não configurada. A IA não funcionará até que você adicione a chave no ambiente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Suggests the best technician based on the ticket description using Gemini 3 Flash.
 */
export const suggestTechnician = async (description: string, technicians: Technician[]): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  const technicianListString = technicians.map(t => `${t.name} (Especialidade: ${t.specialty})`).join(', ');

  const prompt = `
    Analise a descrição do chamado técnico abaixo e sugira o melhor técnico da lista para resolver o problema.
    
    Lista de Técnicos: ${technicianListString}
    
    Descrição do Problema: "${description}"
    
    Retorne apenas o nome exato do técnico sugerido. Se não for óbvio, escolha o técnico com especialidade mais genérica.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTechnicianName: { 
              type: Type.STRING,
              description: "O nome do técnico sugerido"
            }
          },
          required: ["suggestedTechnicianName"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.suggestedTechnicianName || null;
  } catch (error) {
    console.error("Error suggesting technician:", error);
    return null;
  }
};

/**
 * Drafts a polite WhatsApp message to the client using Gemini 3 Flash.
 */
export const draftClientUpdate = async (clientName: string, status: string, technicianName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Olá! Estamos atualizando seu chamado.";

  const prompt = `
    Escreva uma mensagem curta e profissional de WhatsApp para o cliente "${clientName}".
    Informe que o chamado mudou para o status "${status}" e que o técnico responsável é "${technicianName}".
    Se o status for "FINALIZADO", pergunte se está tudo certo.
    Se for "EM ANDAMENTO", diga que estamos trabalhando nisso.
    Se for "ABERTO", confirme o recebimento.
    Seja amigável e use emojis de tecnologia. Não use aspas na resposta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Olá! Seu chamado foi atualizado.";
  } catch (error) {
    console.error("Error drafting message:", error);
    return "Olá! Seu chamado teve uma atualização de status.";
  }
};

/**
 * AI Support Chat (Nova) using Gemini 3 Flash.
 */
export const askSupportAI = async (userMessage: string, conversationHistory: {role: string, text: string}[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Desculpe, o serviço de IA (Nova) não está configurado. Por favor, adicione sua API_KEY do Google AI Studio nas configurações de hospedagem.";

  const systemContext = `
    Você é a **Nova**, a Inteligência Artificial exclusiva da "Inovati Soluções em TI".
    Sua personalidade é prestativa, técnica (mas acessível) e levemente entusiasmada com tecnologia.
    
    FUNCIONALIDADES DO SISTEMA:
    1. Kanban: Colunas dinâmicas para gestão.
    2. Dashboard: Gráficos de performance.
    3. WhatsApp: Botão "Cliente" gera mensagens automáticas via IA.
    4. Exportação: PDF para ordens de serviço e Excel para relatórios.
    5. Equipe: Gestão de técnicos e especialidades.
    6. Tema: Suporte a modo escuro e cores personalizadas.

    Instruções: Seja breve. Se não souber algo sobre o sistema, sugira falar com o suporte humano.
  `;

  const historyParts = conversationHistory.map(h => ({
    text: `${h.role === 'user' ? 'Usuário' : 'Nova'}: ${h.text}`
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: systemContext },
        ...historyParts,
        { text: `Usuário: ${userMessage}` }
      ],
    });
    return response.text || "Não consegui processar sua dúvida.";
  } catch (error) {
    console.error("Error in support chat:", error);
    return "Ops! Tive um pequeno curto-circuito. Pode repetir?";
  }
};