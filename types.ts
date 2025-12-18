export enum TicketStatus {
  OPEN = 'ABERTO',
  IN_PROGRESS = 'EM ANDAMENTO',
  FINISHED = 'FINALIZADO'
}

export interface Technician {
  id: string;
  name: string;
  specialty?: string; // For AI context
}

export interface TicketComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  type: 'NOTE' | 'SYSTEM'; // Note = user comment, System = status change log
}

export type TicketCategory = 'Serviço Interno' | 'Serviço Externo' | 'Atendimentos Nootech';
export type TicketSubCategory = 'Impressora' | 'Computador' | 'Nobreak' | 'Notebook' | 'Infra_Estrutura' | 'Outros';

export interface Ticket {
  id: string;
  clientName: string;
  clientPhone: string; // Used for WhatsApp integration
  description: string;
  technicianId: string;
  status: TicketStatus;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  category?: TicketCategory;
  subCategory?: TicketSubCategory;
  createdAt: string; // ISO String
  scheduledFor?: string; // ISO String
  finishedAt?: string; // ISO String
  comments: TicketComment[];
}

export interface CreateTicketDTO {
  clientName: string;
  clientPhone: string;
  description: string;
  technicianId: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  category: TicketCategory;
  subCategory: TicketSubCategory;
  scheduledFor?: string;
}

export interface SystemConfig {
  companyName: string;
  themeColor: 'orange' | 'blue' | 'violet' | 'emerald' | 'rose' | 'slate';
  themeMode: 'light' | 'dark' | 'auto';
  showClientWhatsappBtn: boolean;
  showTechDispatchBtn: boolean;
}