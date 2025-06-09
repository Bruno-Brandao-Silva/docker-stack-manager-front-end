import React, { useState, useEffect } from 'react';
import type { ClientInput, ClientOutput, ClientUpdate } from '../api'; // Importa tipos da API
import { DynamicInputGroup } from './DynamicInputGroup'; // Importa o componente DynamicInputGroup

interface EnvVar {
    key: string;
    value: string;
}

interface ClientFormModalContentProps {
    isEditMode: boolean;
    onClose: () => void;
    onSubmit: (clientData: ClientInput | ClientUpdate) => void;
    initialData?: ClientOutput;
    clientEnvVars: EnvVar[];
    setClientEnvVars: React.Dispatch<React.SetStateAction<EnvVar[]>>;
}

export const ClientFormModalContent: React.FC<ClientFormModalContentProps> = ({ isEditMode, onClose, onSubmit, initialData, clientEnvVars, setClientEnvVars }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [folderPath, setFolderPath] = useState(initialData?.folder_path || '');
    // A seleção de stacks precisaria buscar stacks disponíveis e gerenciar seus IDs

    useEffect(() => {
        if (initialData?.environment) {
            setClientEnvVars(Object.entries(initialData.environment).map(([key, value]) => ({ key, value })));
        } else {
            setClientEnvVars([{ key: '', value: '' }]);
        }
    }, [initialData, setClientEnvVars]);

    const handleClientEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
        setClientEnvVars(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addClientEnvVar = () => setClientEnvVars(prev => [...prev, { key: '', value: '' }]);
    const removeClientEnvVar = (index: number) => setClientEnvVars(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const environment: Record<string, string> = clientEnvVars.reduce((acc, curr) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const clientData: ClientInput | ClientUpdate = {
            name,
            folder_path: folderPath,
            environment: Object.keys(environment).length > 0 ? environment : undefined,
            // stacks: [] // Implementar lógica de seleção de stack aqui
        };
        onSubmit(clientData);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="client-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
                <input type="text" id="client-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome do Cliente" required value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-[#FF5555] text-sm mt-1 hidden">O nome do cliente é obrigatório.</p>
            </div>
            <div>
                <label htmlFor="client-stacks" className="text-[#CCCCCC] text-sm block mb-2">Stacks</label>
                <select id="client-stacks" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" multiple>
                    <option>Stack Frontend (4 Serviços)</option>
                    <option>Stack Backend (6 Serviços)</option>
                    <option>Stack Database (2 Serviços)</option>
                </select>
            </div>
            <div>
                <label htmlFor="client-folder-path" className="text-[#CCCCCC] text-sm block mb-2">Caminho da Pasta</label>
                <input type="text" id="client-folder-path" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="/var/docker/clients/nome-cliente" value={folderPath} onChange={(e) => setFolderPath(e.target.value)} />
            </div>
            <DynamicInputGroup<EnvVar>
                label="Variáveis de Ambiente"
                items={clientEnvVars}
                onAddItem={addClientEnvVar}
                onRemoveItem={removeClientEnvVar}
                onItemChange={handleClientEnvVarChange}
                placeholderKey="Chave"
                placeholderValue="Valor"
                isKeyValue={true}
            />
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={onClose}>Cancelar</button>
                <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">Salvar</button>
            </div>
        </form>
    );
};
