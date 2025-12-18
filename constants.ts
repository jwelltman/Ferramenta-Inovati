import { Technician } from './types';

export const DEFAULT_TECHNICIANS: Technician[] = [
  { id: '1', name: 'Joabe', specialty: 'Redes e Servidores' },
  { id: '2', name: 'Tiago', specialty: 'Impressoras e Periféricos' },
  { id: '3', name: 'Thiago', specialty: 'Hardware e Montagem' },
  { id: '4', name: 'Shalye', specialty: 'Software e Sistemas' },
  { id: '5', name: 'Delto Jr', specialty: 'Atendimento In Loco' },
  { id: '6', name: 'Carlos', specialty: 'Infraestrutura' },
];

export const INITIAL_TICKETS_KEY = 'techsupport_tickets_v1';
export const TECHNICIANS_KEY = 'techsupport_technicians_v1';