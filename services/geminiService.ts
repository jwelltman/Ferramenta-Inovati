import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Technician } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Suggests the best technician based on the ticket description.
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTechnicianName: { type: Type.STRING }
          }
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
 * Drafts a polite WhatsApp message to the client updating them on status.
 */
export const draftClientUpdate = async (clientName: string, status: string, technicianName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "";

  const prompt = `
    Escreva uma mensagem curta e profissional de WhatsApp para o cliente "${clientName}".
    Informe que o chamado mudou para o status "${status}" e que o técnico responsável é "${technicianName}".
    Se o status for "FINALIZADO", pergunte se está tudo certo.
    Se for "EM ANDAMENTO", diga que estamos trabalhando nisso.
    Se for "ABERTO", confirme o recebimento.
    Não use aspas na resposta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error drafting message:", error);
    return "";
  }
};

/**
 * AI Support Chat for the application help desk.
 */
export const askSupportAI = async (userMessage: string, conversationHistory: {role: string, text: string}[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Desculpe, o serviço de IA não está configurado (API Key ausente).";

  // System context describing the application
  const systemContext = `
    Você é a **Nova**, a Inteligência Artificial exclusiva da "Inovati Soluções em TI".
    Sua personalidade é prestativa, técnica (mas acessível) e levemente entusiasmada com tecnologia.
    Sua função é tirar dúvidas do usuário sobre como usar esta ferramenta específica.
    
    FUNCIONALIDADES DO SISTEMA (Contexto):
    1. **Visualização**: O sistema possui visualização em Kanban (colunas: Aberto, Em Andamento, Finalizado) e Dashboard (KPIs e gráficos).
    2. **Chamados**:
       - Botão "Novo Chamado" no topo cria tickets.
       - IA sugere técnicos com base na descrição do problema.
       - Botão WhatsApp envia atualizações automáticas para o cliente.
    3. **Edição e Ações**:
       - Cada cartão de chamado tem ícones para:
         - **PDF**: Ícone vermelho, exporta APENAS aquele chamado para impressão formatada.
         - **Excel (CSV)**: Ícone verde, baixa os dados daquele chamado.
         - **Seta no Técnico**: Um botão estilo "dropdown" com o nome do técnico que abre a edição rápida.
         - **Lápis**: Edita todas as informações.
         - **Lixeira**: Exclui o chamado.
       - Mudança de status muda a cor da lateral do cartão.
    4. **Técnicos**: Pode-se gerenciar a equipe (Adicionar/Editar/Remover) pelo menu superior "Gerenciar Equipe".
    5. **Configurações**: É possível mudar a cor do tema (Laranja, Azul, Roxo, etc) e ocultar botões de ação.
    6. **Dados**: Tudo é salvo no LocalStorage do navegador (não tem banco de dados externo).

    Se o usuário perguntar seu nome, diga que é a Nova.
    Se o usuário perguntar algo fora do contexto do sistema, responda educadamente que você só pode ajudar com dúvidas sobre a ferramenta Inovati.
    Seja breve, direto e útil.
  `;

  // Format history for the model
  // We just append history to the prompt for simplicity in this stateless flow, 
  // or structure it if using chat mode. Here we simulate chat turn.
  const historyText = conversationHistory.map(h => `${h.role === 'user' ? 'Usuário' : 'Nova'}: ${h.text}`).join('\n');

  const prompt = `
    ${systemContext}

    Histórico da conversa:
    ${historyText}

    Usuário: ${userMessage}
    Nova:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não consegui processar sua dúvida no momento.";
  } catch (error) {
    console.error("Error in support chat:", error);
    return "Ocorreu um erro ao conectar com o suporte inteligente.";
  }
};