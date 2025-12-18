import React, { useState } from 'react';
import { Technician } from '../types';
import { X, Trash2, UserPlus, Shield, Pencil, Check, RotateCcw } from 'lucide-react';

interface TechnicianModalProps {
  onClose: () => void;
  technicians: Technician[];
  onAdd: (name: string, specialty: string) => void;
  onUpdate: (id: string, name: string, specialty: string) => void;
  onDelete: (id: string) => void;
}

const TechnicianModal: React.FC<TechnicianModalProps> = ({ onClose, technicians, onAdd, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && specialty) {
      if (editingId) {
        onUpdate(editingId, name, specialty);
        handleCancelEdit();
      } else {
        onAdd(name, specialty);
        setName('');
        setSpecialty('');
      }
    }
  };

  const handleEditClick = (tech: Technician) => {
    setName(tech.name);
    setSpecialty(tech.specialty || '');
    setEditingId(tech.id);
  };

  const handleCancelEdit = () => {
    setName('');
    setSpecialty('');
    setEditingId(null);
  };

  const inputClass = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white text-black font-medium shadow-sm";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-4 flex justify-between items-center border-b-2 border-orange-500 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500" size={20} />
            <h3 className="text-white font-semibold text-lg">Gerenciar Equipe</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Form (Add or Edit) */}
          <form onSubmit={handleSubmit} className={`mb-6 p-4 rounded-lg border ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${editingId ? 'text-orange-800' : 'text-gray-700'}`}>
                {editingId ? <Pencil size={16} /> : <UserPlus size={16} className="text-orange-600"/>}
                {editingId ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}
            </h4>
            <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Nome"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                
                <div className="relative">
                    <input 
                    type="text" 
                    required
                    list="roles-list"
                    placeholder="Função / Especialidade"
                    className={inputClass}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    />
                    <datalist id="roles-list">
                        <option value="CEO" />
                        <option value="Comercial" />
                        <option value="Técnico N1" />
                        <option value="Técnico N2" />
                        <option value="Redes e Infraestrutura" />
                        <option value="Impressoras" />
                    </datalist>
                </div>

                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        className={`flex-1 text-white text-sm font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {editingId ? <><Check size={16} /> Salvar</> : 'Adicionar'}
                    </button>
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={handleCancelEdit}
                            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            title="Cancelar Edição"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>
          </form>

          {/* List */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Equipe Ativa ({technicians.length})</h4>
            <div className="space-y-2">
                {technicians.map(tech => (
                    <div key={tech.id} className={`flex justify-between items-center border p-3 rounded shadow-sm hover:shadow-md transition-all ${editingId === tech.id ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300' : 'bg-white border-gray-100'}`}>
                        <div>
                            <div className="font-semibold text-gray-800">{tech.name}</div>
                            <div className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                                {tech.specialty}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => handleEditClick(tech)}
                                className="text-gray-400 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                title="Editar"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => onDelete(tech.id)}
                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                title="Remover"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianModal;