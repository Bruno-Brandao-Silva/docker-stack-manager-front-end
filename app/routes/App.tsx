import React, { useState, useEffect, useCallback } from 'react';

// Importa tipos e funções da API
import { Api, type ClientOutput, type StackOutput, type ClientInput, type ClientUpdate, type StackInput, type StackUpdate, type ServiceInput, type ServiceUpdate } from '../api';
// type typeServiceOutput
// Importa componentes
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ClientFormModalContent } from '../components/ClientFormModalContent';
import { StackFormModalContent } from '../components/StackFormModalContent';
import { ServiceFormModalContent } from '../components/ServiceFormModalContent';

// Importa as rotas (páginas)
import { DashboardRoute } from '../routes/DashboardRoute';
import { ClientsRoute } from '../routes/ClientsRoute';
import { ClientDetailRoute } from '../routes/ClientDetailRoute';
import { StacksRoute } from '../routes/StacksRoute';
import { StackDetailRoute } from '../routes/StackDetailRoute';
import { ServicesRoute } from '../routes/ServicesRoute';
import { ServiceDetailRoute } from '../routes/ServiceDetailRoute';
import { SettingsRoute } from '../routes/SettingsRoute';

// Tipos utilitários globais para o App
type ScreenId = 'dashboard' | 'clients' | 'stacks' | 'services' | 'settings' | 'client-detail' | 'stack-detail' | 'service-detail';

interface EnvVar {
    key: string;
    value: string;
}

interface PortMapping {
    value: string;
}

interface VolumeMapping {
    value: string;
}

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isStackModalOpen, setIsStackModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isModalEditMode, setIsModalEditMode] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    const [currentClientData, setCurrentClientData] = useState<ClientOutput | undefined>(undefined);
    const [currentStackData, setCurrentStackData] = useState<StackOutput | undefined>(undefined);
    const [currentServiceData, setCurrentServiceData] = useState<ServiceOutput | undefined>(undefined);

    const [accordionStates, setAccordionStates] = useState<{ [key: string]: boolean }>({
        dockerConfig: true, // Padrão aberto para Configuração Docker
        deployConfig: false,
        dependencies: false,
        buildConfig: false,
        commandEntrypoint: false,
        serviceEnvVars: false,
        portsVolumes: false,
        deployConfigService: false,
    });

    // Estados dos dados da API
    const [clients, setClients] = useState<ClientOutput[]>([]);
    const [stacks, setStacks] = useState<StackOutput[]>([]);
    const [services, setServices] = useState<ServiceOutput[]>([]);

    // Estados de carregamento
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingStacks, setLoadingStacks] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    // Estados de erro
    const [errorClients, setErrorClients] = useState<string | null>(null);
    const [errorStacks, setErrorStacks] = useState<string | null>(null);
    const [errorServices, setErrorServices] = useState<string | null>(null);

    // Token de Autenticação (Placeholder - substituir pela lógica de autenticação real)
    const [authToken, setAuthToken] = useState<string | null>('YOUR_AUTH_TOKEN_HERE'); // Substitua pelo seu token JWT real

    // Estados para campos de formulário dinâmicos nos modais
    const [clientEnvVars, setClientEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }]);
    const [buildArgs, setBuildArgs] = useState<EnvVar[]>([]);
    const [serviceEnvVars, setServiceEnvVars] = useState<EnvVar[]>([]);
    const [servicePorts, setServicePorts] = useState<PortMapping[]>([]);
    const [serviceVolumes, setServiceVolumes] = useState<VolumeMapping[]>([]);


    // --- Funções de busca de dados (Callbacks para evitar recriação desnecessária) ---
    const fetchClients = useCallback(async () => {
        if (!authToken) return;
        setLoadingClients(true);
        setErrorClients(null);
        try {
            const data = await Api.Clients.listClients(authToken);
            setClients(data);
        } catch (err: any) {
            setErrorClients(err.message);
        } finally {
            setLoadingClients(false);
        }
    }, [authToken]);

    const fetchStacks = useCallback(async () => {
        if (!authToken) return;
        setLoadingStacks(true);
        setErrorStacks(null);
        try {
            const data = await Api.Stacks.listStacks(authToken);
            setStacks(data);
        } catch (err: any) {
            setErrorStacks(err.message);
        } finally {
            setLoadingStacks(false);
        }
    }, [authToken]);

    const fetchServices = useCallback(async () => {
        if (!authToken) return;
        setLoadingServices(true);
        setErrorServices(null);
        try {
            const data = await Api.Services.listServices(authToken);
            setServices(data);
        } catch (err: any) {
            setErrorServices(err.message);
        } finally {
            setLoadingServices(false);
        }
    }, [authToken]);

    // --- Ações da API (Criar, Atualizar, Deletar) ---
    const handleCreateClient = async (clientData: ClientInput) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Clients.createClient(clientData, authToken);
            alert('Cliente criado com sucesso!');
            fetchClients();
            closeModal('client-modal');
        } catch (err: any) {
            alert(`Erro ao criar cliente: ${err.message}`);
        }
    };

    const handleUpdateClient = async (clientId: string, clientData: ClientUpdate) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Clients.updateClient(clientId, clientData, authToken);
            alert('Cliente atualizado com sucesso!');
            fetchClients();
            closeModal('client-modal');
        } catch (err: any) {
            alert(`Erro ao atualizar cliente: ${err.message}`);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
            try {
                await Api.Clients.deleteClient(clientId, authToken);
                alert('Cliente deletado com sucesso!');
                fetchClients();
                if (activeScreen === 'client-detail' && selectedClientId === clientId) {
                    setActiveScreen('clients'); // Navega de volta para a lista se o cliente atual for deletado
                    setSelectedClientId(null);
                }
            } catch (err: any) {
                alert(`Erro ao deletar cliente: ${err.message}`);
            }
        }
    };

    const handleCreateStack = async (stackData: StackInput) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Stacks.createStack(stackData, authToken);
            alert('Stack criada com sucesso!');
            fetchStacks();
            closeModal('stack-modal');
        } catch (err: any) {
            alert(`Erro ao criar stack: ${err.message}`);
        }
    };

    const handleUpdateStack = async (stackId: string, stackData: StackUpdate) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Stacks.updateStack(stackId, stackData, authToken);
            alert('Stack atualizada com sucesso!');
            fetchStacks();
            closeModal('stack-modal');
        } catch (err: any) {
            alert(`Erro ao atualizar stack: ${err.message}`);
        }
    };

    const handleDeleteStack = async (stackId: string) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        if (window.confirm('Tem certeza que deseja deletar esta stack?')) {
            try {
                await Api.Stacks.deleteStack(stackId, authToken);
                alert('Stack deletada com sucesso!');
                fetchStacks();
                if (activeScreen === 'stack-detail' && selectedStackId === stackId) {
                    setActiveScreen('stacks');
                    setSelectedStackId(null);
                }
            } catch (err: any) {
                alert(`Erro ao deletar stack: ${err.message}`);
            }
        }
    };

    const handleCreateService = async (serviceData: ServiceInput) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Services.createService(serviceData, authToken);
            alert('Serviço criado com sucesso!');
            fetchServices();
            closeModal('service-modal');
        } catch (err: any) {
            alert(`Erro ao criar serviço: ${err.message}`);
        }
    };

    const handleUpdateService = async (serviceId: string, serviceData: ServiceUpdate) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        try {
            await Api.Services.updateService(serviceId, serviceData, authToken);
            alert('Serviço atualizado com sucesso!');
            fetchServices();
            closeModal('service-modal');
        } catch (err: any) {
            alert(`Erro ao atualizar serviço: ${err.message}`);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!authToken) { alert("Token de autenticação não disponível."); return; }
        if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
            try {
                await Api.Services.deleteService(serviceId, authToken);
                alert('Serviço deletado com sucesso!');
                fetchServices();
                if (activeScreen === 'service-detail' && selectedServiceId === serviceId) {
                    setActiveScreen('services');
                    setSelectedServiceId(null);
                }
            } catch (err: any) {
                alert(`Erro ao deletar serviço: ${err.message}`);
            }
        }
    };


    // --- Lógica de navegação e modal ---
    const showScreen = (screenId: ScreenId) => {
        setActiveScreen(screenId);
        // Reinicia os IDs selecionados ao navegar para uma tela de lista
        if (screenId === 'clients') setSelectedClientId(null);
        if (screenId === 'stacks') setSelectedStackId(null);
        if (screenId === 'services') setSelectedServiceId(null);
    };

    const handleViewClientDetail = (clientId: string) => {
        setSelectedClientId(clientId);
        setActiveScreen('client-detail');
    };

    const handleViewStackDetail = (stackId: string) => {
        setSelectedStackId(stackId);
        setActiveScreen('stack-detail');
    };

    const handleViewServiceDetail = (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setActiveScreen('service-detail');
    };

    const openModal = (modalId: 'client-modal' | 'stack-modal' | 'service-modal', editMode: boolean = false, data?: ClientOutput | StackOutput | ServiceOutput) => {
        setIsModalEditMode(editMode);
        if (modalId === 'client-modal') {
            setCurrentClientData(data as ClientOutput);
            setIsClientModalOpen(true);
            // Reinicia os campos dinâmicos para o modal de cliente
            setClientEnvVars(data && (data as ClientOutput).environment ? Object.entries((data as ClientOutput).environment).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]);
        } else if (modalId === 'stack-modal') {
            setCurrentStackData(data as StackOutput);
            setIsStackModalOpen(true);
        } else if (modalId === 'service-modal') {
            setCurrentServiceData(data as ServiceOutput);
            setIsServiceModalOpen(true);
            // Reinicia os campos dinâmicos para o modal de serviço
            if (data && (data as ServiceOutput).docker_config) {
                const serviceData = data as ServiceOutput;
                setBuildArgs(typeof serviceData.docker_config.build === 'object' && serviceData.docker_config.build.args ? Object.entries(serviceData.docker_config.build.args).map(([key, value]) => ({ key, value })) : []);
                setServiceEnvVars(serviceData.docker_config.environment ? Object.entries(serviceData.docker_config.environment).map(([key, value]) => ({ key, value })) : []);
                setServicePorts(serviceData.docker_config.ports ? serviceData.docker_config.ports.map(p => ({ value: typeof p === 'string' ? p : JSON.stringify(p) })) : []);
                setServiceVolumes(serviceData.docker_config.volumes ? serviceData.docker_config.volumes.map(v => ({ value: typeof v === 'string' ? v : JSON.stringify(v) })) : []);
            } else {
                setBuildArgs([]);
                setServiceEnvVars([]);
                setServicePorts([]);
                setServiceVolumes([]);
            }
        }
    };

    const closeModal = (modalId: 'client-modal' | 'stack-modal' | 'service-modal') => {
        if (modalId === 'client-modal') {
            setIsClientModalOpen(false);
            setCurrentClientData(undefined);
        } else if (modalId === 'stack-modal') {
            setIsStackModalOpen(false);
            setCurrentStackData(undefined);
        } else if (modalId === 'service-modal') {
            setIsServiceModalOpen(false);
            setCurrentServiceData(undefined);
        }
    };

    const toggleAccordion = (panelId: string) => {
        setAccordionStates(prevState => ({
            ...prevState,
            [panelId]: !prevState[panelId],
        }));
    };

    // --- Busca inicial de dados ao montar o componente e mudar o token ---
    useEffect(() => {
        if (authToken) {
            fetchClients();
            fetchStacks();
            fetchServices();
        } else {
            console.warn("Autenticação não disponível. Por favor, forneça um token JWT.");
            // Opcionalmente, redirecionar para uma página de login ou exibir uma mensagem proeminente
        }
    }, [authToken, fetchClients, fetchStacks, fetchServices]);


    return (
        <div className="flex min-h-screen overflow-x-hidden font-inter bg-[#121212] text-[#EEEEEE]">
            {/* Barra Lateral */}
            <Sidebar activeScreen={activeScreen} onNavigate={showScreen} />

            {/* Área de Conteúdo Principal */}
            <div className="flex-grow ml-[200px] flex flex-col sm:ml-0 sm:pt-0">
                {/* Barra Superior */}
                <Topbar />

                {/* Container de Conteúdo da Tela */}
                <div className="p-8 flex-grow overflow-y-auto sm:p-4">
                    {activeScreen === 'dashboard' && <DashboardRoute
                        onViewClientDetail={handleViewClientDetail}
                        clients={clients}
                        stacks={stacks}
                        services={services}
                        loading={{ clients: loadingClients, stacks: loadingStacks, services: loadingServices }}
                        error={{ clients: errorClients, stacks: errorStacks, services: errorServices }}
                    />}
                    {activeScreen === 'clients' && <ClientsRoute
                        onViewClientDetail={handleViewClientDetail}
                        onOpenClientModal={openModal}
                        clients={clients}
                        loading={loadingClients}
                        error={errorClients}
                        onDeleteClient={handleDeleteClient}
                    />}
                    {activeScreen === 'client-detail' && selectedClientId && <ClientDetailRoute
                        clientId={selectedClientId}
                        onOpenClientModal={openModal}
                        onViewServiceDetail={handleViewServiceDetail}
                        accordionStates={accordionStates}
                        toggleAccordion={toggleAccordion}
                        token={authToken}
                    />}
                    {activeScreen === 'stacks' && <StacksRoute
                        onViewStackDetail={handleViewStackDetail}
                        onOpenStackModal={openModal}
                        stacks={stacks}
                        loading={loadingStacks}
                        error={errorStacks}
                        onDeleteStack={handleDeleteStack}
                    />}
                    {activeScreen === 'stack-detail' && selectedStackId && <StackDetailRoute
                        stackId={selectedStackId}
                        onOpenStackModal={openModal}
                        onOpenServiceModal={openModal}
                        onViewServiceDetail={handleViewServiceDetail}
                        token={authToken}
                    />}
                    {activeScreen === 'services' && <ServicesRoute
                        onViewServiceDetail={handleViewServiceDetail}
                        onOpenServiceModal={openModal}
                        services={services}
                        loading={loadingServices}
                        error={errorServices}
                        onDeleteService={handleDeleteService}
                    />}
                    {activeScreen === 'service-detail' && selectedServiceId && <ServiceDetailRoute
                        serviceId={selectedServiceId}
                        onOpenServiceModal={openModal}
                        onViewServiceDetail={handleViewServiceDetail}
                        accordionStates={accordionStates}
                        toggleAccordion={toggleAccordion}
                        token={authToken}
                    />}
                    {activeScreen === 'settings' && <SettingsRoute />}
                </div>
            </div>

            {/* Modais */}
            <Modal id="client-modal" title={isModalEditMode ? 'Editar Cliente' : 'Criar Cliente'} isOpen={isClientModalOpen} onClose={() => closeModal('client-modal')} isEditMode={isModalEditMode}>
                <ClientFormModalContent
                    isEditMode={isModalEditMode}
                    onClose={() => closeModal('client-modal')}
                    onSubmit={isModalEditMode && currentClientData?._id ? (data) => handleUpdateClient(currentClientData._id as string, data as ClientUpdate) : handleCreateClient}
                    initialData={currentClientData}
                    clientEnvVars={clientEnvVars}
                    setClientEnvVars={setClientEnvVars}
                />
            </Modal>

            <Modal id="stack-modal" title={isModalEditMode ? 'Editar Stack' : 'Criar Stack'} isOpen={isStackModalOpen} onClose={() => closeModal('stack-modal')} isEditMode={isModalEditMode}>
                <StackFormModalContent
                    isEditMode={isModalEditMode}
                    onClose={() => closeModal('stack-modal')}
                    onSubmit={isModalEditMode && currentStackData?._id ? (data) => handleUpdateStack(currentStackData._id as string, data as StackUpdate) : handleCreateStack}
                    initialData={currentStackData}
                />
            </Modal>

            <Modal id="service-modal" title={isModalEditMode ? 'Editar Serviço' : 'Criar Serviço'} isOpen={isServiceModalOpen} onClose={() => closeModal('service-modal')} isEditMode={isModalEditMode}>
                <ServiceFormModalContent
                    isEditMode={isModalEditMode}
                    onClose={() => closeModal('service-modal')}
                    onSubmit={isModalEditMode && currentServiceData?._id ? (data) => handleUpdateService(currentServiceData._id as string, data as ServiceUpdate) : handleCreateService}
                    initialData={currentServiceData}
                    accordionStates={accordionStates}
                    toggleAccordion={toggleAccordion}
                    buildArgs={buildArgs}
                    setBuildArgs={setBuildArgs}
                    serviceEnvVars={serviceEnvVars}
                    setServiceEnvVars={setServiceEnvVars}
                    servicePorts={servicePorts}
                    setServicePorts={setServicePorts}
                    serviceVolumes={serviceVolumes}
                    setServiceVolumes={setServiceVolumes}
                />
            </Modal>
        </div>
    );
};

export default App;
