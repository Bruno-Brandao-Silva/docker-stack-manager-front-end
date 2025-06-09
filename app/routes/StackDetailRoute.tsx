import React, { useState, useEffect, useCallback } from 'react';
import { Api, type StackOutput, type ServiceOutput } from '../api'; // Importa tipos da API
import { DataTable } from '../components/DataTable'; // Importa o componente DataTable

interface StackDetailRouteProps {
    stackId: string | null;
    onOpenStackModal: (editMode: boolean, stack?: StackOutput) => void;
    onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
    onViewServiceDetail: (serviceId: string) => void;
    token: string | null;
}

export const StackDetailRoute: React.FC<StackDetailRouteProps> = ({ stackId, onOpenStackModal, onOpenServiceModal, onViewServiceDetail, token }) => {
    const [stack, setStack] = useState<StackOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [associatedServices, setAssociatedServices] = useState<ServiceOutput[]>([]);

    const fetchStackDetails = useCallback(async () => {
        if (!stackId || !token) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedStack = await Api.Stacks.getStack(stackId, token);
            setStack(fetchedStack);

            // Busca serviços associados (mockados se os serviços forem apenas IDs na saída da stack)
            if (fetchedStack.services && fetchedStack.services.length > 0) {
                // Em um aplicativo real, você buscaria cada serviço por ID ou teria um endpoint dedicado
                const allServices = await Api.Services.listServices(token); // Busca todos e filtra para demonstração
                const filteredServices = allServices.filter(s => fetchedStack.services?.some(ref => ref.id === s._id));
                setAssociatedServices(filteredServices);
            } else {
                setAssociatedServices([]);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [stackId, token]);

    useEffect(() => {
        fetchStackDetails();
    }, [fetchStackDetails]);

    if (loading) return <div className="text-center text-gray-400 py-8">Carregando detalhes da stack...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Erro ao carregar stack: {error}</div>;
    if (!stack) return <div className="text-center text-gray-400 py-8">Stack não encontrada.</div>;

    return (
        <div id="stack-detail-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{stack.name}</h2>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenStackModal(true, stack)}>
                        <i className="fas fa-edit mr-2"></i> Editar
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
                        <i className="fas fa-trash-alt mr-2"></i> Deletar
                    </button>
                </div>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl mb-6">
                <h3 className="text-xl font-semibold mb-4">Serviços na Stack</h3>
                <DataTable
                    headers={[
                        { key: 'name', label: 'Nome do Serviço' },
                        { key: 'image', label: 'Imagem', className: 'font-mono' },
                        { key: 'status', label: 'Status' }, // Status mockado
                    ]}
                    data={associatedServices.map(s => ({
                        _id: s._id,
                        name: s.docker_config.name,
                        image: s.docker_config.image || 'N/A',
                        status: 'Ativo' // Status mockado para serviços associados
                    }))}
                    onRowClick={(item) => item._id && onViewServiceDetail(item._id as string)}
                    renderCell={(item, key) => {
                        if (key === 'status') {
                            return (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'Ativo' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>
                                    {item.status}
                                </span>
                            );
                        }
                        return item[key as keyof typeof item];
                    }}
                    renderActions={(item) => (
                        <button className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); if (item._id) onViewServiceDetail(item._id as string); }}><i className="fas fa-search"></i></button>
                    )}
                    loading={loading} // Usa o estado de carregamento da stack para esta tabela
                    error={error} // Usa o estado de erro da stack para esta tabela
                />
                <div className="flex justify-end mt-4">
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenServiceModal(false)}>
                        <i className="fas fa-plus mr-2"></i> Adicionar Serviço
                    </button>
                </div>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-semibold mb-4">Configurações Avançadas (Opcional)</h3>
                <p className="text-gray-400">Nenhuma configuração avançada definida para esta stack.</p>
            </div>
        </div>
    );
};
