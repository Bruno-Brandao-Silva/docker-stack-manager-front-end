import React, { useState } from 'react';
import type { StackInput, StackOutput, StackUpdate } from '../api'; // Importa tipos da API

interface StackFormModalContentProps {
    isEditMode: boolean;
    onClose: () => void;
    onSubmit: (stackData: StackInput | StackUpdate) => void;
    initialData?: StackOutput;
}

export const StackFormModalContent: React.FC<StackFormModalContentProps> = ({ isEditMode, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const stackData: StackInput | StackUpdate = {
            name,
            // services: [] // Implementar lógica de seleção de serviço aqui
        };
        onSubmit(stackData);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="stack-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
                <input type="text" id="stack-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome da Stack" required value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-[#FF5555] text-sm mt-1 hidden">O nome da stack é obrigatório.</p>
            </div>
            <div>
                <label htmlFor="stack-services" className="text-[#CCCCCC] text-sm block mb-2">Serviços</label>
                <select id="stack-services" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" multiple>
                    <option>Serviço Autenticação (auth-api:2.0)</option>
                    <option>Serviço Pagamentos (payments-worker:1.5)</option>
                    <option>Serviço Nginx (nginx:latest)</option>
                    <option>Serviço React App (my-react-app:1.0)</option>
                </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={onClose}>Cancelar</button>
                <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">Salvar</button>
            </div>
        </form>
    );
};
