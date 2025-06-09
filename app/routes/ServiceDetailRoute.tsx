import React, { useState, useEffect, useCallback } from 'react';
import { Api, type ServiceOutput } from '../api'; // Importa tipos da API
import { AccordionItem } from '../components/AccordionItem'; // Importa o componente AccordionItem

interface ServiceDetailRouteProps {
    serviceId: string | null;
    onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
    onViewServiceDetail: (serviceId: string) => void; // Para links de dependência
    accordionStates: { [key: string]: boolean };
    toggleAccordion: (panelId: string) => void;
    token: string | null;
}

export const ServiceDetailRoute: React.FC<ServiceDetailRouteProps> = ({ onOpenServiceModal, onViewServiceDetail, accordionStates, toggleAccordion, serviceId, token }) => {
    const [service, setService] = useState<ServiceOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceDetails = useCallback(async () => {
        if (!serviceId || !token) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedService = await Api.Services.getService(serviceId, token);
            setService(fetchedService);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [serviceId, token]);

    useEffect(() => {
        fetchServiceDetails();
    }, [fetchServiceDetails]);

    if (loading) return <div className="text-center text-gray-400 py-8">Carregando detalhes do serviço...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Erro ao carregar serviço: {error}</div>;
    if (!service) return <div className="text-center text-gray-400 py-8">Serviço não encontrado.</div>;

    const dockerConfig = service.docker_config;

    return (
        <div id="service-detail-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{dockerConfig.name}</h2>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenServiceModal(true, service)}>
                        <i className="fas fa-edit mr-2"></i> Editar
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
                        <i className="fas fa-trash-alt mr-2"></i> Deletar
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <AccordionItem
                    title="Configuração Docker"
                    isOpen={accordionStates.dockerConfig}
                    onToggle={() => toggleAccordion('dockerConfig')}
                >
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Nome:</p>
                        <p className="font-mono text-white">{dockerConfig.name}</p>
                    </div>
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Imagem:</p>
                        <p className="font-mono text-white">{dockerConfig.image || 'N/A'}</p>
                    </div>
                    {dockerConfig.build && (
                        <div>
                            <p className="text-[#CCCCCC] text-sm block mb-1">Build:</p>
                            <div className="bg-gray-800 p-3 rounded-md text-sm font-mono">
                                {typeof dockerConfig.build === 'string' ? (
                                    <p>{dockerConfig.build}</p>
                                ) : (
                                    <>
                                        <p><span className="text-gray-400">Context:</span> {dockerConfig.build.context || 'N/A'}</p>
                                        <p><span className="text-gray-400">Dockerfile:</span> {dockerConfig.build.dockerfile || 'N/A'}</p>
                                        {dockerConfig.build.args && Object.keys(dockerConfig.build.args).length > 0 && (
                                            <>
                                                <p><span className="text-gray-400">Args:</span></p>
                                                <ul className="list-disc list-inside ml-4">
                                                    {Object.entries(dockerConfig.build.args).map(([key, value]) => (
                                                        <li key={key}>{key}={value}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Comando:</p>
                        <p className="font-mono text-white">{Array.isArray(dockerConfig.command) ? dockerConfig.command.join(' ') : dockerConfig.command || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Portas:</p>
                        <ul className="list-disc list-inside ml-4 font-mono text-white">
                            {dockerConfig.ports && dockerConfig.ports.length > 0 ? (
                                dockerConfig.ports.map((port, index) => (
                                    <li key={index}>{typeof port === 'string' ? port : JSON.stringify(port)}</li>
                                ))
                            ) : 'N/A'}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Variáveis de Ambiente:</p>
                        {dockerConfig.environment && Object.keys(dockerConfig.environment).length > 0 ? (
                            <table className="w-full text-sm mt-1">
                                <thead>
                                    <tr className="bg-gray-700">
                                        <th className="p-2 rounded-tl-md">Chave</th>
                                        <th className="p-2 rounded-tr-md">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(dockerConfig.environment).map(([key, value]) => (
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
                </AccordionItem>

                <AccordionItem
                    title="Configuração de Deploy"
                    isOpen={accordionStates.deployConfig}
                    onToggle={() => toggleAccordion('deployConfig')}
                >
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Modo:</p>
                        <p className="font-mono text-white">{dockerConfig.deploy?.mode || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Réplicas:</p>
                        <p className="font-mono text-white">{dockerConfig.deploy?.replicas || 'N/A'}</p>
                    </div>
                    {dockerConfig.deploy?.resources && (
                        <div>
                            <p className="text-[#CCCCCC] text-sm block mb-1">Recursos:</p>
                            <div className="bg-gray-800 p-3 rounded-md text-sm font-mono">
                                {dockerConfig.deploy.resources.limits && Object.keys(dockerConfig.deploy.resources.limits).length > 0 && (
                                    <p><span className="text-gray-400">Limits:</span> {Object.entries(dockerConfig.deploy.resources.limits).map(([k, v]) => `${k}=${v}`).join(', ')}</p>
                                )}
                                {dockerConfig.deploy.resources.reservations && Object.keys(dockerConfig.deploy.resources.reservations).length > 0 && (
                                    <p><span className="text-gray-400">Reservations:</span> {Object.entries(dockerConfig.deploy.resources.reservations).map(([k, v]) => `${k}=${v}`).join(', ')}</p>
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-[#CCCCCC] text-sm block mb-1">Política de Reinício:</p>
                        <p className="font-mono text-white">{dockerConfig.deploy?.restart_policy?.condition || 'N/A'}</p>
                    </div>
                </AccordionItem>

                <AccordionItem
                    title="Dependências"
                    isOpen={accordionStates.dependencies}
                    onToggle={() => toggleAccordion('dependencies')}
                >
                    {dockerConfig.depends_on && (Array.isArray(dockerConfig.depends_on) ? dockerConfig.depends_on.length > 0 : Object.keys(dockerConfig.depends_on).length > 0) ? (
                        Array.isArray(dockerConfig.depends_on) ? (
                            dockerConfig.depends_on.map((dep, index) => (
                                <p key={index} className="font-mono text-white cursor-pointer hover:underline" onClick={() => onViewServiceDetail(dep)}>{dep}</p>
                            ))
                        ) : (
                            Object.keys(dockerConfig.depends_on).map((depName, index) => (
                                <p key={index} className="font-mono text-white cursor-pointer hover:underline" onClick={() => onViewServiceDetail(depName)}>{depName}</p>
                            ))
                        )
                    ) : (
                        <p className="text-gray-400">Nenhuma dependência definida.</p>
                    )}
                </AccordionItem>
            </div>
        </div>
    );
};
