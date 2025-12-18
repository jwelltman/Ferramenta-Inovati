import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { X, Save, Layout, Settings as SettingsIcon, MousePointerClick, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  config: SystemConfig;
  onSave: (newConfig: SystemConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<SystemConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'appearance' | 'actions'>('appearance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  const colors = [
    { name: 'Laranja Inovati', value: 'orange', class: 'bg-orange-600' },
    { name: 'Azul Corporativo', value: 'blue', class: 'bg-blue-600' },
    { name: 'Roxo Criativo', value: 'violet', class: 'bg-violet-600' },
    { name: 'Verde Sucesso', value: 'emerald', class: 'bg-emerald-600' },
    { name: 'Vermelho Alerta', value: 'rose', class: 'bg-rose-600' },
    { name: 'Cinza Neutro', value: 'slate', class: 'bg-slate-600' },
  ];

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-black dark:text-white font-medium shadow-sm placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className={`p-4 flex justify-between items-center border-b-2 border-${localConfig.themeColor}-500 bg-black shrink-0`}>
          <div className="flex items-center gap-2">
            <SettingsIcon className={`text-${localConfig.themeColor}-500`} size={20} />
            <h3 className="text-white font-semibold text-lg">Configurações do Sistema</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'appearance' ? `text-${localConfig.themeColor}-600 dark:text-${localConfig.themeColor}-400 border-b-2 border-${localConfig.themeColor}-600 dark:border-${localConfig.themeColor}-400` : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
                <Layout size={16} /> Aparência
            </button>
            <button 
                onClick={() => setActiveTab('actions')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'actions' ? `text-${localConfig.themeColor}-600 dark:text-${localConfig.themeColor}-400 border-b-2 border-${localConfig.themeColor}-600 dark:border-${localConfig.themeColor}-400` : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
                <MousePointerClick size={16} /> Botões e Ações
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Nome da Empresa (Cabeçalho)</label>
                    <input 
                        type="text" 
                        required
                        className={inputClass}
                        value={localConfig.companyName}
                        onChange={(e) => setLocalConfig({...localConfig, companyName: e.target.value})}
                    />
                </div>

                {/* Theme Mode Selection */}
                <div>
                   <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Modo de Exibição</label>
                   <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setLocalConfig({...localConfig, themeMode: 'light'})}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${localConfig.themeMode === 'light' ? `border-${localConfig.themeColor}-500 bg-${localConfig.themeColor}-50 dark:bg-${localConfig.themeColor}-900/20 text-${localConfig.themeColor}-700 dark:text-${localConfig.themeColor}-300` : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                      >
                        <Sun size={24} />
                        <span className="text-xs font-bold">Claro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocalConfig({...localConfig, themeMode: 'dark'})}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${localConfig.themeMode === 'dark' ? `border-${localConfig.themeColor}-500 bg-${localConfig.themeColor}-50 dark:bg-${localConfig.themeColor}-900/20 text-${localConfig.themeColor}-700 dark:text-${localConfig.themeColor}-300` : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                      >
                        <Moon size={24} />
                        <span className="text-xs font-bold">Escuro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocalConfig({...localConfig, themeMode: 'auto'})}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${localConfig.themeMode === 'auto' ? `border-${localConfig.themeColor}-500 bg-${localConfig.themeColor}-50 dark:bg-${localConfig.themeColor}-900/20 text-${localConfig.themeColor}-700 dark:text-${localConfig.themeColor}-300` : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                      >
                        <Monitor size={24} />
                        <span className="text-xs font-bold">Automático</span>
                      </button>
                   </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Cor do Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setLocalConfig({...localConfig, themeColor: color.value as any})}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${localConfig.themeColor === color.value ? 'border-black dark:border-white ring-1 ring-black dark:ring-white bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <div className={`w-6 h-6 rounded-full ${color.class} shadow-sm`}></div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'actions' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Visibilidade dos Botões</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Gerencie quais atalhos aparecem nos cards dos chamados.</p>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600"
                                checked={localConfig.showClientWhatsappBtn}
                                onChange={(e) => setLocalConfig({...localConfig, showClientWhatsappBtn: e.target.checked})}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Botão "Falar com Cliente" (WhatsApp)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600"
                                checked={localConfig.showTechDispatchBtn}
                                onChange={(e) => setLocalConfig({...localConfig, showTechDispatchBtn: e.target.checked})}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Botão "Enviar para Técnico"</span>
                        </label>
                    </div>
                </div>
             </div>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button 
                type="submit" 
                className={`w-full text-white font-bold py-2 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 bg-${localConfig.themeColor}-600 hover:bg-${localConfig.themeColor}-700`}
            >
                <Save size={18} />
                Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;