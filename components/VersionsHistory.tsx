import React from 'react';
import { History, CheckCircle2, Star, Rocket, Sparkles, Moon, Globe } from 'lucide-react';
import { SystemConfig } from '../types';

interface VersionsHistoryProps {
  config: SystemConfig;
}

const VERSIONS = [
  {
    version: "1.4",
    date: "Mar 2024",
    title: "Pronto para Produção",
    icon: <Globe className="text-emerald-500" size={20} />,
    changes: [
      "Migração para Gemini 3 Flash (IA mais rápida e precisa).",
      "Otimização de rotas para hospedagem em Vercel e Netlify.",
      "Melhoria no tratamento de erros de API Key.",
      "Ajustes finais de responsividade para dispositivos móveis."
    ]
  },
  {
    version: "1.3",
    date: "Fev 2024",
    title: "Experiência Visual e Personalização",
    icon: <Moon className="text-indigo-500" size={20} />,
    changes: [
      "Implementação de Modo Escuro (Dark Mode) nativo.",
      "Opções de tema: Claro, Escuro e Automático (conforme sistema).",
      "Melhorias na acessibilidade e contraste das fontes.",
      "Refatoração dos componentes de Dashboard para suporte a temas."
    ]
  },
  {
    version: "1.2",
    date: "Fev 2024",
    title: "Identidade Visual Inovati",
    icon: <Rocket className="text-orange-500" size={20} />,
    changes: [
      "Integração do novo logotipo oficial da Inovati.",
      "Customização do botão da IA com branding da empresa.",
      "Sistema de cores dinâmico nas configurações.",
      "Otimização da renderização de ícones de marca."
    ]
  },
  {
    version: "1.1",
    date: "Jan 2024",
    title: "Inteligência Artificial Nova",
    icon: <Sparkles className="text-blue-500" size={20} />,
    changes: [
      "Nascimento da 'Nova', a IA de suporte interno.",
      "Sugestão inteligente de técnicos baseada na descrição do problema.",
      "Chatbot integrado para dúvidas sobre o uso do sistema.",
      "Geração automática de mensagens personalizadas para WhatsApp."
    ]
  },
  {
    version: "1.0",
    date: "Dez 2023",
    title: "Lançamento do Painel Inovati",
    icon: <Star className="text-yellow-500" size={20} />,
    changes: [
      "Estrutura Kanban para gestão de chamados (Abertos/Andamento/Finais).",
      "Módulo de Gerenciamento de Equipe Técnica.",
      "Exportação de dados para Excel (CSV) e PDF.",
      "Dashboard com KPIs de produtividade e prioridades."
    ]
  }
];

const VersionsHistory: React.FC<VersionsHistoryProps> = ({ config }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className={`p-2 bg-${config.themeColor}-100 dark:bg-${config.themeColor}-900/30 rounded-lg`}>
          <History className={`text-${config.themeColor}-600 dark:text-${config.themeColor}-400`} size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notas de Atualização</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe a evolução da ferramenta interna da Inovati</p>
        </div>
      </div>

      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-10 py-2">
        {VERSIONS.map((v, idx) => (
          <div key={v.version} className="relative pl-8">
            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 ${idx === 0 ? `bg-${config.themeColor}-500 shadow-[0_0_10px_rgba(234,88,12,0.5)]` : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded bg-${config.themeColor}-100 dark:bg-${config.themeColor}-900/40 text-${config.themeColor}-700 dark:text-${config.themeColor}-300 border border-${config.themeColor}-200 dark:border-${config.themeColor}-800`}>
                v{v.version}
              </span>
              <span className="text-xs text-gray-400 font-medium">{v.date}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                {v.icon}
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{v.title}</h3>
              </div>
              
              <ul className="space-y-3">
                {v.changes.map((change, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <Sparkles className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
        <h4 className="font-bold text-gray-700 dark:text-gray-300">Em desenvolvimento...</h4>
        <p className="text-xs text-gray-500 dark:text-gray-500 max-w-xs mx-auto mt-1">Nossa equipe trabalha constantemente para trazer novas automações e melhorias de segurança.</p>
      </div>
    </div>
  );
};

export default VersionsHistory;