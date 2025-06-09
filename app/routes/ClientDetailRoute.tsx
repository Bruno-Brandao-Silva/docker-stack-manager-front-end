import React, { useState, useEffect, useCallback } from 'react';
import { Api, type ClientOutput } from '../api'; // Importa tipos da API
import { AccordionItem } from '../components/AccordionItem'; // Importa o componente AccordionItem

interface ClientDetailRouteProps {
    clientId: string | null;
    onOpenClientModal: (editMode: boolean, client?: ClientOutput) => void;
    onViewServiceDetail: (serviceId: string) => void;
    accordionStates: { [key: string]: boolean };
    toggleAccordion: (panelId: string) => void;
    token: string | null;
}

export const ClientDetailRoute: React.FC<ClientDetailRouteProps> = ({ clientId, onOpenClientModal, onViewServiceDetail, accordionStates, toggleAccordion, token }) => {
    const [client, setClient] = useState<ClientOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [composeLogs, setComposeLogs] = useState<string>('');
    const [composePsData, setComposePsData] = useState<any[]>([]);
    const [composeStatus, setComposeStatus] = useState<string>('UNKNOWN');

    const fetchClientDetails = useCallback(async () => {
        if (!clientId || !token) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedClient = await Api.Clients.getClient(clientId, token);
            setClient(fetchedClient);

            // Busca Status do Compose, Logs, PS (dados mockados para exibição, já que a API retorna esquema vazio)
            const statusResponse = await Api.Compose.composeStatus(clientId, token);
            setComposeStatus(statusResponse.status || 'UP'); // Assumindo que statusResponse tem um campo status

            const logsResponse = await Api.Compose.composeLogs(clientId, token);
            setComposeLogs(logsResponse.logs || `[${new Date().toLocaleTimeString()}] Logs mockados para o cliente ${clientId}...`);

            const psResponse = await Api.Compose.composePs(clientId, token);
            setComposePsData(psResponse.data || [ // Estrutura de dados mockados para ps
                { container: `${fetchedClient.name}_web_1`, image: 'nginx:latest', state: 'Running', ports: '0.0.0.0:8080->80/tcp' },
                { container: `${fetchedClient.name}_api_1`, image: 'node:18', state: 'Running', ports: '0.0.0.0:3000->3000/tcp' },
                { container: `${fetchedClient.name}_db_1`, image: 'postgres:14', state: 'Running', ports: '5432/tcp' },
            ]);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [clientId, token]);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    if (loading) return <div className="text-center text-gray-400 py-8">Carregando detalhes do cliente...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Erro ao carregar cliente: {error}</div>;
    if (!client) return <div className="text-center text-gray-400 py-8">Cliente não encontrado.</div>;

    const handleComposeAction = async (action: keyof typeof Api.Compose, id: string, serviceName?: string, replicas?: number, command?: string) => {
        if (!token) {
            alert("Token de autenticação não disponível.");
            return;
        }
        try {
            let response;
            if (action === 'composeScale' && serviceName && replicas !== undefined) {
                response = await Api.Compose.composeScale(id, serviceName, replicas, token);
            } else if (action === 'composeExec' && serviceName && command) {
                response = await Api.Compose.composeExec(id, serviceName, command, token);
            } else {
                response = await Api.Compose[action](id, token);
            }
            // Re-busca os detalhes do cliente para atualizar o status após a ação
            fetchClientDetails();
            alert(`Ação '${String(action)}' executada com sucesso!`);
        } catch (err: any) {
            alert(`Erro ao executar ação '${String(action)}': ${err.message}`);
        }
    };


    return (
        <div id="client-detail-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{client.name}</h2>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenClientModal(true, client)}>
                        <i className="fas fa-edit mr-2"></i> Editar Cliente
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
                        <i className="fas fa-trash-alt mr-2"></i> Deletar Cliente
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => handleComposeAction('deployClient', client._id as string)}>
                        <i className="fas fa-rocket mr-2"></i> Deploy
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('checkDeploymentIntegrity', client._id as string)}>
                        <i className="fas fa-clipboard-check mr-2"></i> Checar Integridade
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Coluna Esquerda */}
                <div className="md:w-3/5 space-y-6">
                    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Informações Gerais</h3>
                        <div className="space-y-3 text-sm">
                            <p><span className="text-[#CCCCCC] text-sm block mb-1">ID:</span> <span className="font-mono text-gray-400">{client._id}</span></p>
                            <p><span className="text-[#CCCCCC] text-sm block mb-1">Caminho da Pasta:</span> <span className="font-mono text-gray-400">{client.folder_path || 'N/A'}</span></p>
                            <div>
                                <span className="text-[#CCCCCC] text-sm block mb-2">Variáveis de Ambiente:</span>
                                {client.environment && Object.keys(client.environment).length > 0 ? (
                                    <table className="w-full text-sm mt-1">
                                        <thead>
                                            <tr className="bg-gray-700">
                                                <th className="p-2 rounded-tl-md">Chave</th>
                                                <th className="p-2 rounded-tr-md">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(client.environment).map(([key, value]) => (
                                                <tr key={key} className="bg-gray-800">
                                                    <td className="p-2 font-mono">{key}</td>
                                                    <td className="p-2 font-mono">{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-400">Nenhuma variável de ambiente definida.</p>
                                )}
                            </div>
                            <p><span className="text-[#CCCCCC] text-sm block mb-1">Criado em:</span> <span>{client.created_at ? new Date(client.created_at).toLocaleString('pt-BR') : 'N/A'}</span></p>
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Stacks Associadas</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {client.stacks && client.stacks.length > 0 ? (
                                client.stacks.map(stack => (
                                    <span key={stack.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#06B6D4] text-white cursor-pointer hover:opacity-80">
                                        {stack.id} {/* Em um aplicativo real, você buscaria o nome da stack */}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-400">Nenhuma stack associada.</p>
                            )}
                        </div>
                        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
                            <i className="fas fa-plus mr-2"></i> Vincular Stack
                        </button>
                    </div>
                </div>

                {/* Coluna Direita */}
                <div className="md:w-2/5 space-y-6">
                    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Controles do Compose</h3>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[#CCCCCC] text-sm block mb-1">Status Atual:</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${composeStatus === 'UP' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>{composeStatus}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => handleComposeAction('composeUp', client._id as string)}><i className="fas fa-play mr-2"></i> UP</button>
                            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('composeDown', client._id as string)}><i className="fas fa-stop mr-2"></i> DOWN</button>
                            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('composeRestart', client._id as string)}><i className="fas fa-sync-alt mr-2"></i> RESTART</button>
                            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('composeKill', client._id as string)}><i className="fas fa-skull-crossbones mr-2"></i> KILL</button>
                        </div>
                        <div className="mb-4">
                            <label className="text-[#CCCCCC] text-sm block mb-2">Escalar Serviço:</label>
                            <div className="flex space-x-2">
                                <select className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base flex-grow placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50">
                                    <option>Serviço Web</option>
                                    <option>Serviço API</option>
                                </select>
                                <input type="number" defaultValue="1" min="0" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-20 text-center placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
                                <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => handleComposeAction('composeScale', client._id as string, 'mock-service', 2)}><i className="fas fa-arrows-alt-v"></i> Aplicar</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[#CCCCCC] text-sm block mb-2">Comando Exec:</label>
                            <div className="flex space-x-2">
                                <input type="text" placeholder="Ex: bash" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base flex-grow font-mono placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
                                <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => handleComposeAction('composeExec', client._id as string, 'mock-service', undefined, 'ls -la')}><i className="fas fa-terminal"></i> Enviar</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Logs em Tempo Real</h3>
                        <div className="bg-gray-900 rounded-md p-4 h-64 overflow-y-auto font-mono text-sm text-gray-300">
                            <pre>{composeLogs}</pre>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('composeLogs', client._id as string)}><i className="fas fa-sync-alt mr-2"></i> Atualizar</button>
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Status dos Contêineres</h3>
                        <table className="w-full border-collapse mt-6 bg-[#1E1E1E] rounded-lg overflow-hidden text-sm">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm">Contêiner</th>
                                    <th className="p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm">Imagem</th>
                                    <th className="p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm">Estado</th>
                                    <th className="p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm">Portas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {composePsData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-4 border-b border-[#2E2E2E] font-mono">{item.container}</td>
                                        <td className="p-4 border-b border-[#2E2E2E] font-mono">{item.image}</td>
                                        <td className="p-4 border-b border-[#2E2E2E]"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.state === 'Running' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>{item.state}</span></td>
                                        <td className="p-4 border-b border-[#2E2E2E] font-mono">{item.ports}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-end mt-4">
                            <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => handleComposeAction('composePs', client._id as string)}><i className="fas fa-sync-alt mr-2"></i> Atualizar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
