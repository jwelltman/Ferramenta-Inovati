import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus, CreateTicketDTO, Technician, TicketComment, SystemConfig } from './types';
import { INITIAL_TICKETS_KEY, DEFAULT_TECHNICIANS, TECHNICIANS_KEY } from './constants';
import TicketCard from './components/TicketCard';
import TicketForm from './components/TicketForm';
import TechnicianModal from './components/TechnicianModal';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import BrandLogo from './components/BrandLogo';
import SupportChat from './components/SupportChat';
import { Plus, Search, Users, LayoutDashboard, Kanban, LogOut, Settings as SettingsIcon } from 'lucide-react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Default Config
const DEFAULT_CONFIG: SystemConfig = {
  companyName: 'Inovati Soluções em TI',
  themeColor: 'orange',
  themeMode: 'auto',
  showClientWhatsappBtn: true,
  showTechDispatchBtn: true
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'dashboard'>('kanban');
  
  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('inovati_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load Config
  useEffect(() => {
      const savedConfig = localStorage.getItem('inovati_config');
      if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
      }
  }, []);

  // Apply Theme Mode
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
        let themeToApply = config.themeMode;
        
        if (themeToApply === 'auto') {
            themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (themeToApply === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    applyTheme();

    // Listener for system changes if in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (config.themeMode === 'auto') applyTheme();
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);

  }, [config.themeMode]);

  // Save Config
  const handleSaveConfig = (newConfig: SystemConfig) => {
      setConfig(newConfig);
      localStorage.setItem('inovati_config', JSON.stringify(newConfig));
      setIsSettingsOpen(false);
  };

  // Load initial data for Tickets
  useEffect(() => {
    const savedTickets = localStorage.getItem(INITIAL_TICKETS_KEY);
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
        const dummies: Ticket[] = [
            { 
              id: generateId(), 
              clientName: 'Escritório Contábil Alfa', 
              clientPhone: '5511999999999', 
              description: 'Impressora de rede offline', 
              technicianId: '2', 
              status: TicketStatus.OPEN, 
              priority: 'ALTA', 
              category: 'Serviço Externo',
              subCategory: 'Impressora',
              createdAt: new Date().toISOString(),
              comments: [
                { id: generateId(), author: 'Sistema', content: 'Chamado criado via Painel', createdAt: new Date().toISOString(), type: 'SYSTEM' }
              ]
            },
            { 
              id: generateId(), 
              clientName: 'Mercado Silva', 
              clientPhone: '5511988888888', 
              description: 'Computador do caixa não liga', 
              technicianId: '5', 
              status: TicketStatus.IN_PROGRESS, 
              priority: 'MEDIA',
              category: 'Serviço Interno',
              subCategory: 'Computador', 
              createdAt: new Date().toISOString(),
              comments: [] 
            },
        ];
        setTickets(dummies);
        localStorage.setItem(INITIAL_TICKETS_KEY, JSON.stringify(dummies));
    }
  }, []);

  // Load initial data for Technicians
  useEffect(() => {
    const savedTechs = localStorage.getItem(TECHNICIANS_KEY);
    if (savedTechs) {
        setTechnicians(JSON.parse(savedTechs));
    } else {
        setTechnicians(DEFAULT_TECHNICIANS);
        localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
    }
  }, []);

  // Save Tickets on change
  useEffect(() => {
    if (tickets.length > 0) {
        localStorage.setItem(INITIAL_TICKETS_KEY, JSON.stringify(tickets));
    }
  }, [tickets]);

   // Save Technicians on change
   useEffect(() => {
     if (technicians.length > 0) {
        localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
     }
   }, [technicians]);


  // Auth Handlers
  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('inovati_session', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('inovati_session');
  };

  // Ticket Handlers
  const handleSaveTicket = (data: CreateTicketDTO) => {
    if (editingTicket) {
      // Update existing
      setTickets(tickets.map(t => t.id === editingTicket.id ? { 
        ...t, 
        ...data,
        // Preserve comments when updating main data
        comments: t.comments || [] 
      } : t));
    } else {
      // Create new
      const newTicket: Ticket = {
        id: generateId(),
        ...data,
        status: TicketStatus.OPEN,
        createdAt: new Date().toISOString(),
        comments: [
            { id: generateId(), author: 'Sistema', content: 'Chamado aberto', createdAt: new Date().toISOString(), type: 'SYSTEM' }
        ]
      };
      setTickets([...tickets, newTicket]);
    }
    closeModal();
  };

  // Handler specifically for adding comments from the modal
  const handleAddComment = (ticketId: string, text: string) => {
    setTickets(tickets.map(t => {
        if (t.id === ticketId) {
            const newComment: TicketComment = {
                id: generateId(),
                author: 'Admin', // In a real app, use the logged user
                content: text,
                createdAt: new Date().toISOString(),
                type: 'NOTE'
            };
            return { ...t, comments: [...(t.comments || []), newComment] };
        }
        return t;
    }));
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    setTickets(tickets.map(t => {
        if (t.id === id) {
            const statusComment: TicketComment = {
                id: generateId(),
                author: 'Sistema',
                content: `Status alterado para ${newStatus}`,
                createdAt: new Date().toISOString(),
                type: 'SYSTEM'
            };

            return {
                ...t,
                status: newStatus,
                finishedAt: newStatus === TicketStatus.FINISHED ? new Date().toISOString() : undefined,
                comments: [...(t.comments || []), statusComment]
            };
        }
        return t;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
        setTickets(tickets.filter(t => t.id !== id));
    }
  };

  // Technician Handlers
  const handleAddTechnician = (name: string, specialty: string) => {
      const newTech: Technician = {
          id: generateId(),
          name,
          specialty
      };
      setTechnicians([...technicians, newTech]);
  };

  const handleUpdateTechnician = (id: string, name: string, specialty: string) => {
      setTechnicians(technicians.map(t => t.id === id ? { ...t, name, specialty } : t));
  };

  const handleDeleteTechnician = (id: string) => {
      if (window.confirm('Excluir membro da equipe?')) {
          setTechnicians(technicians.filter(t => t.id !== id));
      }
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const filteredTickets = tickets.filter(t => 
    t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTicketsByStatus = (status: TicketStatus) => filteredTickets.filter(t => t.status === status);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} config={config} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm sticky top-0 z-10 border-b-2 border-${config.themeColor}-600`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <BrandLogo className="dark:text-white" />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex border border-gray-200 dark:border-gray-600">
                    <button 
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? `bg-${config.themeColor}-600 text-white shadow` : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Kanban size={16} />
                        <span className="hidden sm:inline">Quadro</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'dashboard' ? `bg-${config.themeColor}-600 text-white shadow` : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <LayoutDashboard size={16} />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <button 
                  onClick={() => setIsTechModalOpen(true)}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                  title="Gerenciar Equipe"
                >
                  <Users size={20} />
                </button>

                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                  title="Configurações"
                >
                  <SettingsIcon size={20} />
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-500 px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                  title="Sair do Sistema"
                >
                  <LogOut size={20} />
                </button>

                <button 
                  onClick={openCreateModal}
                  className={`bg-${config.themeColor}-600 text-white hover:bg-${config.themeColor}-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg ml-2`}
                >
                  <Plus size={20} />
                  <span className="hidden md:inline">Novo Chamado</span>
                </button>
            </div>
          </div>

          {/* Search only visible in Kanban mode */}
          {viewMode === 'kanban' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center animate-fade-in pb-1">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, descrição ou categoria..." 
                        className={`w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-black dark:text-white font-medium focus:ring-2 focus:ring-${config.themeColor}-500 outline-none placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: <span className="font-bold">{filteredTickets.length}</span>
                </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'dashboard' ? (
            <div className="flex-1 overflow-y-auto">
                <Dashboard tickets={tickets} technicians={technicians} config={config} />
            </div>
        ) : (
            /* Kanban Board */
            <div className="flex-1 overflow-x-auto p-4 sm:p-6">
                <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[300px]">
                    
                    {/* Column: Open */}
                    <div className="flex flex-col h-full bg-gray-200/60 dark:bg-gray-800/40 rounded-xl p-2 border border-gray-300 dark:border-gray-700">
                        <div className="flex items-center justify-between p-3 border-b border-gray-300 dark:border-gray-700 mb-2">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                Abertos
                            </h3>
                            <span className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-bold">
                                {getTicketsByStatus(TicketStatus.OPEN).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                            {getTicketsByStatus(TicketStatus.OPEN).map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    technicians={technicians}
                                    config={config}
                                    onStatusChange={handleStatusChange} 
                                    onDelete={handleDelete}
                                    onEdit={openEditModal}
                                />
                            ))}
                            {getTicketsByStatus(TicketStatus.OPEN).length === 0 && (
                                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Nenhum chamado aberto</div>
                            )}
                        </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className={`flex flex-col h-full bg-${config.themeColor}-50/50 dark:bg-${config.themeColor}-900/10 rounded-xl p-2 border border-${config.themeColor}-200 dark:border-${config.themeColor}-900/30`}>
                        <div className={`flex items-center justify-between p-3 border-b border-${config.themeColor}-200 dark:border-${config.themeColor}-900/30 mb-2`}>
                            <h3 className={`font-semibold text-${config.themeColor}-900 dark:text-${config.themeColor}-300 flex items-center gap-2`}>
                                <span className={`w-2 h-2 rounded-full bg-${config.themeColor}-500 animate-pulse`}></span>
                                Em Andamento
                            </h3>
                            <span className={`bg-${config.themeColor}-100 dark:bg-${config.themeColor}-900/40 text-${config.themeColor}-800 dark:text-${config.themeColor}-200 px-2 py-0.5 rounded text-xs font-bold`}>
                                {getTicketsByStatus(TicketStatus.IN_PROGRESS).length}
                            </span>
                        </div>
                        <div className={`flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-${config.themeColor}-300 dark:scrollbar-thumb-${config.themeColor}-800`}>
                            {getTicketsByStatus(TicketStatus.IN_PROGRESS).map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    technicians={technicians}
                                    config={config}
                                    onStatusChange={handleStatusChange} 
                                    onDelete={handleDelete}
                                    onEdit={openEditModal}
                                />
                            ))}
                            {getTicketsByStatus(TicketStatus.IN_PROGRESS).length === 0 && (
                                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Nenhum em andamento</div>
                            )}
                        </div>
                    </div>

                    {/* Column: Finished */}
                    <div className="flex flex-col h-full bg-green-50/50 dark:bg-green-900/10 rounded-xl p-2 border border-green-200 dark:border-green-900/30">
                        <div className="flex items-center justify-between p-3 border-b border-green-200 dark:border-green-900/30 mb-2">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Finalizados
                            </h3>
                            <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-xs font-bold">
                                {getTicketsByStatus(TicketStatus.FINISHED).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-green-300 dark:scrollbar-thumb-green-800">
                            {getTicketsByStatus(TicketStatus.FINISHED).map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    technicians={technicians}
                                    config={config}
                                    onStatusChange={handleStatusChange} 
                                    onDelete={handleDelete}
                                    onEdit={openEditModal}
                                />
                            ))}
                            {getTicketsByStatus(TicketStatus.FINISHED).length === 0 && (
                                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Nenhum finalizado recentemente</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        )}
      </main>

      {/* Support Chat Component */}
      <SupportChat config={config} />

      {isModalOpen && (
        <TicketForm 
            onClose={closeModal} 
            onSubmit={handleSaveTicket}
            onAddComment={handleAddComment}
            initialData={editingTicket}
            technicians={technicians}
            config={config}
        />
      )}

      {isTechModalOpen && (
          <TechnicianModal 
            onClose={() => setIsTechModalOpen(false)}
            technicians={technicians}
            onAdd={handleAddTechnician}
            onUpdate={handleUpdateTechnician}
            onDelete={handleDeleteTechnician}
          />
      )}

      {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            config={config}
            onSave={handleSaveConfig}
          />
      )}
    </div>
  );
}

export default App;