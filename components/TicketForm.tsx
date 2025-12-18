import React, { useState, useEffect, useRef } from 'react';
import { CreateTicketDTO, Technician, Ticket, TicketComment, SystemConfig, TicketCategory, TicketSubCategory } from '../types';
import { suggestTechnician } from '../services/geminiService';
import { Sparkles, X, Send, User, Clock, MessageSquare, Tag, Layers } from 'lucide-react';

interface TicketFormProps {
  onClose: () => void;
  onSubmit: (data: CreateTicketDTO) => void;
  onAddComment?: (ticketId: string, text: string) => void;
  initialData?: Ticket | null;
  technicians: Technician[];
  config: SystemConfig;
}

const CATEGORIES: TicketCategory[] = ['Serviço Interno', 'Serviço Externo', 'Atendimentos Nootech'];
const SUB_CATEGORIES: TicketSubCategory[] = ['Computador', 'Notebook', 'Impressora', 'Nobreak', 'Infra_Estrutura', 'Outros'];

const TicketForm: React.FC<TicketFormProps> = ({ onClose, onSubmit, onAddComment, initialData, technicians, config }) => {
  const [formData, setFormData] = useState<CreateTicketDTO>({
    clientName: '',
    clientPhone: '',
    description: '',
    technicianId: '',
    priority: 'MEDIA',
    category: 'Serviço Interno',
    subCategory: 'Computador',
    scheduledFor: ''
  });
  const [newComment, setNewComment] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        clientPhone: initialData.clientPhone,
        description: initialData.description,
        technicianId: initialData.technicianId,
        priority: initialData.priority,
        category: initialData.category || 'Serviço Interno',
        subCategory: initialData.subCategory || 'Outros',
        scheduledFor: initialData.scheduledFor || ''
      });
    }
  }, [initialData]);

  // Scroll to bottom of comments when opened or updated
  useEffect(() => {
    if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [initialData?.comments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiSuggest = async () => {
    if (!formData.description) return;
    setIsSuggesting(true);
    const suggestedName = await suggestTechnician(formData.description, technicians);
    
    if (suggestedName) {
        // Find ID by name
        const tech = technicians.find(t => t.name.toLowerCase().includes(suggestedName.toLowerCase()) || suggestedName.toLowerCase().includes(t.name.toLowerCase()));
        if (tech) {
            setFormData(prev => ({ ...prev, technicianId: tech.id }));
        }
    }
    setIsSuggesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const submitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() && initialData && onAddComment) {
          onAddComment(initialData.id, newComment);
          setNewComment('');
      }
  };

  // Shared input class for consistency
  const inputClass = `w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-${config.themeColor}-500 outline-none bg-white dark:bg-gray-700 text-black dark:text-white font-medium placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${initialData ? 'max-w-4xl' : 'max-w-md'} overflow-hidden flex flex-col max-h-[90vh] transition-colors`}>
        {/* Header */}
        <div className={`bg-black p-4 flex justify-between items-center border-b-2 border-${config.themeColor}-500 shrink-0`}>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            {initialData ? (
                <>
                    <span className={`text-${config.themeColor}-500`}>#{initialData.id.substring(0,4)}</span>
                    Detalhes do Chamado
                </>
            ) : 'Novo Chamado'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-hidden flex-1">
            {/* Left Column: Form Details */}
            <div className={`p-6 overflow-y-auto ${initialData ? 'md:w-1/2 md:border-r border-gray-200 dark:border-gray-700' : 'w-full'}`}>
                <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Cliente</label>
                        <input 
                        type="text" 
                        name="clientName"
                        required
                        className={inputClass}
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Nome da Empresa ou Pessoa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">WhatsApp Cliente</label>
                        <input 
                        type="tel" 
                        name="clientPhone"
                        required
                        className={inputClass}
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="5511999999999"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1">
                                <Tag size={14} /> Categoria
                            </label>
                            <select 
                                name="category"
                                className={inputClass}
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1">
                                <Layers size={14} /> Sub-Categoria
                            </label>
                            <select 
                                name="subCategory"
                                className={inputClass}
                                value={formData.subCategory}
                                onChange={handleInputChange}
                            >
                                {SUB_CATEGORIES.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Descrição do Problema</label>
                            <button 
                                type="button"
                                onClick={handleAiSuggest}
                                disabled={!formData.description || isSuggesting}
                                className={`text-xs flex items-center gap-1 text-${config.themeColor}-600 dark:text-${config.themeColor}-400 hover:text-${config.themeColor}-800 dark:hover:text-${config.themeColor}-300 disabled:opacity-50 font-bold`}
                            >
                                <Sparkles size={12} />
                                {isSuggesting ? 'Pensando...' : 'Sugerir Técnico'}
                            </button>
                        </div>
                        <textarea 
                        name="description"
                        required
                        rows={4}
                        className={inputClass}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva o problema (ex: Impressora fiscal travada)"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Técnico</label>
                            <select 
                                name="technicianId"
                                required
                                className={inputClass}
                                value={formData.technicianId}
                                onChange={handleInputChange}
                            >
                                <option value="">Selecione...</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id} className="text-black">{tech.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Prioridade</label>
                            <select 
                                name="priority"
                                className={inputClass}
                                value={formData.priority}
                                onChange={handleInputChange}
                            >
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTA">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Agendamento (Opcional)</label>
                        <input 
                        type="datetime-local" 
                        name="scheduledFor"
                        className={inputClass}
                        value={formData.scheduledFor}
                        onChange={handleInputChange}
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className={`w-full bg-${config.themeColor}-600 text-white font-bold py-2 rounded-lg hover:bg-${config.themeColor}-700 transition-colors shadow-md text-base`}
                        >
                            {initialData ? 'Salvar Alterações' : 'Criar Chamado'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column: Timeline/Comments (Only visible if initialData exists) */}
            {initialData && (
                <div className="md:w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Clock size={16} className={`text-${config.themeColor}-500`} />
                            Histórico & Comentários
                        </h4>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {initialData.comments && initialData.comments.length > 0 ? (
                            initialData.comments.map(comment => (
                                <div key={comment.id} className={`flex gap-3 ${comment.type === 'SYSTEM' ? 'opacity-75' : ''}`}>
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${comment.type === 'SYSTEM' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'}`}>
                                        {comment.type === 'SYSTEM' ? 'SYS' : comment.author.substring(0,2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.author}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`text-sm rounded-lg p-3 ${comment.type === 'SYSTEM' ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 italic border border-gray-200 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'}`}>
                                            {comment.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                Nenhum histórico registrado.
                            </div>
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={submitComment} className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm bg-white dark:bg-gray-700 text-black dark:text-white font-medium shadow-sm placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Adicionar observação interna..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-gray-900 dark:bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TicketForm;