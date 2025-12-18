import React, { useState } from 'react';
import { Ticket, TicketStatus, Technician, SystemConfig } from '../types';
import { Clock, CheckCircle, AlertCircle, Calendar, MessageCircle, User, Pencil, Tag, Layers, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { draftClientUpdate } from '../services/geminiService';

interface TicketCardProps {
  ticket: Ticket;
  technicians: Technician[];
  config: SystemConfig;
  onStatusChange: (id: string, status: TicketStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, technicians, config, onStatusChange, onDelete, onEdit }) => {
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  
  const technician = technicians.find(t => t.id === ticket.technicianId);

  const priorityColor = {
    'BAIXA': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'ALTA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  const statusColor = {
    [TicketStatus.OPEN]: 'border-l-4 border-gray-400 dark:border-gray-500',
    [TicketStatus.IN_PROGRESS]: `border-l-4 border-${config.themeColor}-500`,
    [TicketStatus.FINISHED]: 'border-l-4 border-green-500'
  };

  // Dynamic styles for the Status Select Dropdown
  const statusSelectStyles = {
    [TicketStatus.OPEN]: 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 font-medium',
    [TicketStatus.IN_PROGRESS]: `bg-${config.themeColor}-100 text-${config.themeColor}-800 border-${config.themeColor}-300 dark:bg-${config.themeColor}-900/40 dark:text-${config.themeColor}-200 dark:border-${config.themeColor}-700 font-bold`,
    [TicketStatus.FINISHED]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700 font-bold'
  };

  const handleWhatsAppClick = async () => {
    setIsGeneratingMsg(true);
    let message = '';
    
    // Try to use AI to draft a nice message
    try {
      message = await draftClientUpdate(ticket.clientName, ticket.status, technician?.name || 'Equipe');
    } catch (e) {
      // Fallback
      message = `Olá ${ticket.clientName}, atualização sobre seu chamado: ${ticket.status}. Técnico: ${technician?.name}.`;
    }

    setIsGeneratingMsg(false);

    // Create WhatsApp Link
    // Format phone: remove non-digits
    const cleanPhone = ticket.clientPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleTechDispatch = () => {
    // Simulate sending to Technician via WhatsApp (Assuming we have their number, or just generic share)
    const message = `🔧 *Novo Chamado Atribuído*\n\n*Cliente:* ${ticket.clientName}\n*Problema:* ${ticket.description}\n*Prioridade:* ${ticket.priority}\n*ID:* ${ticket.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleExportSingleExcel = () => {
    const headers = ['ID', 'Cliente', 'Telefone', 'Categoria', 'Status', 'Prioridade', 'Técnico', 'Descrição'];
    const techName = technician?.name || 'N/A';
    const cleanDesc = ticket.description.replace(/"/g, '""');
    
    const row = [
        ticket.id,
        ticket.clientName,
        ticket.clientPhone,
        ticket.category || '',
        ticket.status,
        ticket.priority,
        techName,
        cleanDesc
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(';'), row.map(c => `"${c}"`).join(';')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chamado_${ticket.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSinglePDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const techName = technician?.name || 'N/A';
    const date = new Date(ticket.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(ticket.createdAt).toLocaleTimeString('pt-BR');
    
    const commentsHtml = ticket.comments && ticket.comments.length > 0 
        ? ticket.comments.map(c => `
            <div class="comment">
                <div class="comment-header">
                    <strong>${c.author}</strong> - ${new Date(c.createdAt).toLocaleString('pt-BR')}
                </div>
                <div>${c.content}</div>
            </div>
          `).join('')
        : '<p>Sem histórico.</p>';

    const htmlContent = `
        <html>
        <head>
            <title>Chamado #${ticket.id}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #333; }
                .header { border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 20px; }
                h1 { margin: 0; font-size: 24px; color: #333; }
                .meta { font-size: 14px; color: #666; margin-top: 5px; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; }
                .value { font-size: 16px; margin-top: 2px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .box { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .comment { border-bottom: 1px solid #eee; padding: 10px 0; font-size: 13px; }
                .comment-header { font-size: 11px; color: #888; margin-bottom: 2px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Ordem de Serviço #${ticket.id.substring(0,6).toUpperCase()}</h1>
                <div class="meta">Emitido em: ${new Date().toLocaleString('pt-BR')}</div>
            </div>

            <div class="grid section">
                <div>
                    <div class="label">Cliente</div>
                    <div class="value">${ticket.clientName}</div>
                    <div style="font-size:12px; color:#666">${ticket.clientPhone}</div>
                </div>
                <div style="text-align:right">
                    <div class="label">Status</div>
                    <div class="value" style="font-weight:bold">${ticket.status}</div>
                </div>
            </div>

            <div class="grid section">
                <div>
                     <div class="label">Técnico Responsável</div>
                     <div class="value">${techName}</div>
                </div>
                 <div>
                     <div class="label">Prioridade</div>
                     <div class="value">${ticket.priority}</div>
                </div>
            </div>

            <div class="section box">
                <div class="label">Descrição do Problema</div>
                <div class="value" style="margin-top:5px; white-space: pre-wrap;">${ticket.description}</div>
            </div>

             <div class="grid section">
                <div>
                     <div class="label">Categoria</div>
                     <div class="value">${ticket.category || '-'}</div>
                </div>
                 <div>
                     <div class="label">Sub-Categoria</div>
                     <div class="value">${ticket.subCategory || '-'}</div>
                </div>
            </div>

            <div class="section">
                <div class="label" style="border-bottom: 1px solid #ddd; padding-bottom:5px; margin-bottom:10px;">Histórico de Ações</div>
                ${commentsHtml}
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-all ${statusColor[ticket.status]}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate flex-1 mr-2">{ticket.clientName}</h4>
        <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${priorityColor[ticket.priority]}`}>
            {ticket.priority}
            </span>
            <button 
                onClick={() => onEdit(ticket)}
                className={`text-gray-400 hover:text-${config.themeColor}-500 dark:hover:text-${config.themeColor}-400 p-1`}
                title="Editar Chamado"
            >
                <Pencil size={14} />
            </button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-2">
        {ticket.category && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                <Tag size={10} /> {ticket.category}
            </span>
        )}
        {ticket.subCategory && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                <Layers size={10} /> {ticket.subCategory}
            </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{ticket.description}</p>
      
      {/* Technician UI with "Dropdown/Arrow" style */}
      <div className="mb-2">
         <button 
            onClick={() => onEdit(ticket)}
            className="group flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-xs transition-colors w-full sm:w-auto"
            title="Alterar Técnico"
         >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${technician ? `bg-${config.themeColor}-100 dark:bg-${config.themeColor}-900/50 text-${config.themeColor}-600 dark:text-${config.themeColor}-300` : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                <User size={12} />
            </div>
            <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Técnico</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{technician ? technician.name : 'Não atribuído'}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 ml-auto sm:ml-2" />
         </button>
      </div>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mb-3">
        <Calendar size={12} className="mr-1" />
        <span>
            {ticket.scheduledFor 
              ? `Agendado: ${new Date(ticket.scheduledFor).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})}` 
              : `Criado: ${new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit'})}`}
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
            {/* Status Actions - Styled Dynamically */}
            <select 
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
                className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-${config.themeColor}-500 cursor-pointer transition-colors ${statusSelectStyles[ticket.status]}`}
            >
                <option value={TicketStatus.OPEN}>Aberto</option>
                <option value={TicketStatus.IN_PROGRESS}>Em Andamento</option>
                <option value={TicketStatus.FINISHED}>Finalizado</option>
            </select>

            <div className="flex items-center gap-1">
                <button 
                    onClick={handleExportSingleExcel}
                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Baixar Excel"
                >
                    <FileSpreadsheet size={16} />
                </button>
                <button 
                    onClick={handleExportSinglePDF}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Imprimir PDF"
                >
                    <FileText size={16} />
                </button>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-600 mx-1"></div>
                <button onClick={() => onDelete(ticket.id)} className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300">
                    Excluir
                </button>
            </div>
        </div>

        {(config.showClientWhatsappBtn || config.showTechDispatchBtn) && (
            <div className="flex gap-2 mt-1">
                {config.showClientWhatsappBtn && (
                    <button 
                        onClick={handleWhatsAppClick}
                        disabled={isGeneratingMsg}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded transition-colors"
                    >
                        <MessageCircle size={14} />
                        {isGeneratingMsg ? 'Gerando...' : 'Cliente'}
                    </button>
                )}
                {config.showTechDispatchBtn && (
                    <button 
                        onClick={handleTechDispatch}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-xs py-1.5 rounded transition-colors"
                    >
                        <User size={14} />
                        Enviar Téc.
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;