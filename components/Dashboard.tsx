import React from 'react';
import { Ticket, TicketStatus, Technician, SystemConfig } from '../types';
import { PieChart, BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  technicians: Technician[];
  config: SystemConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ tickets, technicians, config }) => {
  // 1. Calculate KPIs
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgressTickets = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const finishedTickets = tickets.filter(t => t.status === TicketStatus.FINISHED).length;

  // 2. Technician Stats
  const techStats = technicians.map(tech => {
    const count = tickets.filter(t => t.technicianId === tech.id && t.status !== TicketStatus.FINISHED).length;
    const completed = tickets.filter(t => t.technicianId === tech.id && t.status === TicketStatus.FINISHED).length;
    return { name: tech.name, count, completed, total: count + completed };
  }).sort((a, b) => b.total - a.total); // Sort by busiest

  const maxTicketCount = Math.max(...techStats.map(t => t.total), 1);

  // 3. Priority Distribution
  const highPriority = tickets.filter(t => t.priority === 'ALTA').length;
  const medPriority = tickets.filter(t => t.priority === 'MEDIA').length;
  const lowPriority = tickets.filter(t => t.priority === 'BAIXA').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUp className={`text-${config.themeColor}-600 dark:text-${config.themeColor}-400`} /> 
            Dashboard de Performance
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Visão Geral da Operação</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-gray-800 dark:border-gray-600 flex justify-between items-center transition-colors">
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Chamados</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{totalTickets}</h3>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full text-gray-600 dark:text-gray-300">
                <BarChart3 size={24} />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-gray-400 dark:border-gray-500 flex justify-between items-center transition-colors">
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Abertos</p>
                <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-200">{openTickets}</h3>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full text-gray-500 dark:text-gray-400">
                <AlertCircle size={24} />
            </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-${config.themeColor}-500 flex justify-between items-center transition-colors`}>
            <div>
                <p className={`text-xs text-${config.themeColor}-600 dark:text-${config.themeColor}-400 uppercase font-bold tracking-wider`}>Em Andamento</p>
                <h3 className={`text-3xl font-bold text-${config.themeColor}-600 dark:text-${config.themeColor}-400`}>{inProgressTickets}</h3>
            </div>
            <div className={`bg-${config.themeColor}-50 dark:bg-${config.themeColor}-900/20 p-3 rounded-full text-${config.themeColor}-500 dark:text-${config.themeColor}-400`}>
                <Clock size={24} />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center transition-colors">
            <div>
                <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Finalizados</p>
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">{finishedTickets}</h3>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full text-green-500 dark:text-green-400">
                <CheckCircle size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Carga de Trabalho por Técnico */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Users size={18} className={`text-${config.themeColor}-600 dark:text-${config.themeColor}-400`} />
                Produtividade da Equipe
            </h3>
            <div className="space-y-4">
                {techStats.map(tech => (
                    <div key={tech.name} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-gray-600 dark:text-gray-300 truncate text-right">{tech.name}</div>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            {/* Finished portion */}
                            <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${(tech.completed / maxTicketCount) * 100}%` }}
                                title={`${tech.completed} Finalizados`}
                            ></div>
                            {/* Active portion */}
                            <div 
                                className={`h-full bg-${config.themeColor}-500`} 
                                style={{ width: `${(tech.count / maxTicketCount) * 100}%` }}
                                title={`${tech.count} Ativos`}
                            ></div>
                        </div>
                        <div className="w-16 text-xs text-gray-500 dark:text-gray-400 text-right">
                            <span className="font-bold text-gray-800 dark:text-gray-200">{tech.total}</span> total
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Finalizados</div>
                <div className="flex items-center gap-2"><div className={`w-3 h-3 bg-${config.themeColor}-500 rounded-full`}></div> Em Andamento/Aberto</div>
            </div>
        </div>

        {/* Distribuição de Prioridade e Status */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-colors">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Prioridade dos Chamados</h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-600 dark:text-red-400 font-medium">Alta</span>
                            <span className="text-gray-600 dark:text-gray-400">{highPriority}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div className="h-2 bg-red-500 rounded-full" style={{ width: `${totalTickets ? (highPriority/totalTickets)*100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">Média</span>
                            <span className="text-gray-600 dark:text-gray-400">{medPriority}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${totalTickets ? (medPriority/totalTickets)*100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Baixa</span>
                            <span className="text-gray-600 dark:text-gray-400">{lowPriority}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${totalTickets ? (lowPriority/totalTickets)*100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                     <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-sm">Eficiência de Fechamento</h3>
                     <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {totalTickets > 0 ? Math.round((finishedTickets / totalTickets) * 100) : 0}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">dos chamados concluídos</span>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;