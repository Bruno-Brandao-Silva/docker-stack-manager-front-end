import React, { useState, useEffect } from 'react';
import type { ServiceInput, ServiceOutput, ServiceUpdate } from '../api'; // Importa tipos da API
import { DynamicInputGroup } from './DynamicInputGroup'; // Importa o componente DynamicInputGroup
import { AccordionItem } from './AccordionItem'; // Importa o componente AccordionItem

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

interface ServiceFormModalContentProps {
    isEditMode: boolean;
    onClose: () => void;
    onSubmit: (serviceData: ServiceInput | ServiceUpdate) => void;
    initialData?: ServiceOutput;
    accordionStates: { [key: string]: boolean };
    toggleAccordion: (panelId: string) => void;
    buildArgs: EnvVar[];
    setBuildArgs: React.Dispatch<React.SetStateAction<EnvVar[]>>;
    serviceEnvVars: EnvVar[];
    setServiceEnvVars: React.Dispatch<React.SetStateAction<EnvVar[]>>;
    servicePorts: PortMapping[];
    setServicePorts: React.Dispatch<React.SetStateAction<PortMapping[]>>;
    serviceVolumes: VolumeMapping[];
    setServiceVolumes: React.Dispatch<React.SetStateAction<VolumeMapping[]>>;
}

export const ServiceFormModalContent: React.FC<ServiceFormModalContentProps> = ({
    isEditMode,
    onClose,
    onSubmit,
    initialData,
    accordionStates,
    toggleAccordion,
    buildArgs,
    setBuildArgs,
    serviceEnvVars,
    setServiceEnvVars,
    servicePorts,
    setServicePorts,
    serviceVolumes,
    setServiceVolumes,
}) => {
    const [name, setName] = useState(initialData?.docker_config.name || '');
    const [image, setImage] = useState(initialData?.docker_config.image || '');
    const [context, setContext] = useState(typeof initialData?.docker_config.build === 'object' ? initialData.docker_config.build.context || '' : '');
    const [dockerfile, setDockerfile] = useState(typeof initialData?.docker_config.build === 'object' ? initialData.docker_config.build.dockerfile || '' : '');
    const [command, setCommand] = useState(Array.isArray(initialData?.docker_config.command) ? initialData.docker_config.command.join(' ') : initialData?.docker_config.command || '');
    const [entrypoint, setEntrypoint] = useState(Array.isArray(initialData?.docker_config.entrypoint) ? initialData.docker_config.entrypoint.join(' ') : initialData?.docker_config.entrypoint || '');
    const [deployMode, setDeployMode] = useState(initialData?.docker_config.deploy?.mode || 'replicated');
    const [deployReplicas, setDeployReplicas] = useState(initialData?.docker_config.deploy?.replicas || 1);


    useEffect(() => {
        if (typeof initialData?.docker_config.build === 'object' && initialData.docker_config.build.args) {
            setBuildArgs(Object.entries(initialData.docker_config.build.args).map(([key, value]) => ({ key, value })));
        } else {
            setBuildArgs([]);
        }
        if (initialData?.docker_config.environment) {
            setServiceEnvVars(Object.entries(initialData.docker_config.environment).map(([key, value]) => ({ key, value })));
        } else {
            setServiceEnvVars([]);
        }
        if (initialData?.docker_config.ports) {
            setServicePorts(initialData.docker_config.ports.map(p => ({ value: typeof p === 'string' ? p : JSON.stringify(p) })));
        } else {
            setServicePorts([]);
        }
        if (initialData?.docker_config.volumes) {
            setServiceVolumes(initialData.docker_config.volumes.map(v => ({ value: typeof v === 'string' ? v : JSON.stringify(v) })));
        } else {
            setServiceVolumes([]);
        }
    }, [initialData, setBuildArgs, setServiceEnvVars, setServicePorts, setServiceVolumes]);


    const handleBuildArgChange = (index: number, field: 'key' | 'value', value: string) => {
        setBuildArgs(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };
    const addBuildArg = () => setBuildArgs(prev => [...prev, { key: '', value: '' }]);
    const removeBuildArg = (index: number) => setBuildArgs(prev => prev.filter((_, i) => i !== index));

    const handleServiceEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
        setServiceEnvVars(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };
    const addServiceEnvVar = () => setServiceEnvVars(prev => [...prev, { key: '', value: '' }]);
    const removeServiceEnvVar = (index: number) => setServiceEnvVars(prev => prev.filter((_, i) => i !== index));

    const handlePortChange = (index: number, value: string) => {
        setServicePorts(prev => prev.map((item, i) => (i === index ? { value } : item)));
    };
    const addPortField = () => setServicePorts(prev => [...prev, { value: '' }]);
    const removePortField = (index: number) => setServicePorts(prev => prev.filter((_, i) => i !== index));

    const handleVolumeChange = (index: number, value: string) => {
        setServiceVolumes(prev => prev.map((item, i) => (i === index ? { value } : item)));
    };
    const addVolumeField = () => setServiceVolumes(prev => [...prev, { value: '' }]);
    const removeVolumeField = (index: number) => setServiceVolumes(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const buildArgsMap = buildArgs.reduce((acc, curr) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const serviceEnvVarsMap = serviceEnvVars.reduce((acc, curr) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const dockerConfig = {
            name,
            image,
            build: (context || dockerfile || Object.keys(buildArgsMap).length > 0) ? {
                context: context || undefined,
                dockerfile: dockerfile || undefined,
                args: Object.keys(buildArgsMap).length > 0 ? buildArgsMap : undefined,
            } : undefined,
            command: command ? command.split(' ') : undefined, // Assumindo comando separado por espaços
            entrypoint: entrypoint ? entrypoint.split(' ') : undefined,
            environment: Object.keys(serviceEnvVarsMap).length > 0 ? serviceEnvVarsMap : undefined,
            ports: servicePorts.map(p => p.value),
            volumes: serviceVolumes.map(v => v.value),
            deploy: {
                mode: deployMode,
                replicas: deployReplicas,
            },
            // Adicione outros campos de DockerServiceConfig conforme necessário do formulário
        };

        const serviceData: ServiceInput | ServiceUpdate = {
            docker_config: dockerConfig as any, // Asserção de tipo para simplificar, refinar conforme necessário
        };
        onSubmit(serviceData);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="service-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
                <input type="text" id="service-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome do Serviço" required value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-[#FF5555] text-sm mt-1 hidden">O nome do serviço é obrigatório.</p>
            </div>
            <div>
                <label htmlFor="service-image" className="text-[#CCCCCC] text-sm block mb-2">Imagem <span className="text-red-500">*</span></label>
                <input type="text" id="service-image" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: nginx:latest" required value={image} onChange={(e) => setImage(e.target.value)} />
                <p className="text-[#FF5555] text-sm mt-1 hidden">A imagem é obrigatória.</p>
            </div>

            <AccordionItem
                title="Configuração de Build"
                isOpen={accordionStates.buildConfig}
                onToggle={() => toggleAccordion('buildConfig')}
            >
                <div>
                    <label htmlFor="build-context" className="text-[#CCCCCC] text-sm block mb-2">Context</label>
                    <input type="text" id="build-context" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="./app" value={context} onChange={(e) => setContext(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="build-dockerfile" className="text-[#CCCCCC] text-sm block mb-2">Dockerfile</label>
                    <input type="text" id="build-dockerfile" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Dockerfile" value={dockerfile} onChange={(e) => setDockerfile(e.target.value)} />
                </div>
                <DynamicInputGroup<EnvVar>
                    label="Args"
                    items={buildArgs}
                    onAddItem={addBuildArg}
                    onRemoveItem={removeBuildArg}
                    onItemChange={handleBuildArgChange}
                    placeholderKey="Chave"
                    placeholderValue="Valor"
                    isKeyValue={true}
                />
            </AccordionItem>

            <AccordionItem
                title="Comando e Entrypoint"
                isOpen={accordionStates.commandEntrypoint}
                onToggle={() => toggleAccordion('commandEntrypoint')}
            >
                <div>
                    <label htmlFor="service-command" className="text-[#CCCCCC] text-sm block mb-2">Comando</label>
                    <input type="text" id="service-command" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: npm start" value={command} onChange={(e) => setCommand(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="service-entrypoint" className="text-[#CCCCCC] text-sm block mb-2">Entrypoint</label>
                    <input type="text" id="service-entrypoint" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: /usr/bin/entrypoint.sh" value={entrypoint} onChange={(e) => setEntrypoint(e.target.value)} />
                </div>
            </AccordionItem>

            <AccordionItem
                title="Variáveis de Ambiente"
                isOpen={accordionStates.serviceEnvVars}
                onToggle={() => toggleAccordion('serviceEnvVars')}
            >
                <DynamicInputGroup<EnvVar>
                    label="Variáveis de Ambiente"
                    items={serviceEnvVars}
                    onAddItem={addServiceEnvVar}
                    onRemoveItem={removeServiceEnvVar}
                    onItemChange={handleServiceEnvVarChange}
                    placeholderKey="Chave"
                    placeholderValue="Valor"
                    isKeyValue={true}
                />
            </AccordionItem>

            <AccordionItem
                title="Portas e Volumes"
                isOpen={accordionStates.portsVolumes}
                onToggle={() => toggleAccordion('portsVolumes')}
            >
                <DynamicInputGroup<PortMapping>
                    label="Portas (Host:Container)"
                    items={servicePorts}
                    onAddItem={addPortField}
                    onRemoveItem={removePortField}
                    onItemChange={handlePortChange}
                    placeholderValue="Host:Container (ex: 8080:80)"
                    isKeyValue={false}
                />
                <DynamicInputGroup<VolumeMapping>
                    label="Volumes (Host:Container)"
                    items={serviceVolumes}
                    onAddItem={addVolumeField}
                    onRemoveItem={removeVolumeField}
                    onItemChange={handleVolumeChange}
                    placeholderValue="Host:Container (ex: ./data:/var/data)"
                    isKeyValue={false}
                />
            </AccordionItem>

            <AccordionItem
                title="Configuração de Deploy"
                isOpen={accordionStates.deployConfigService}
                onToggle={() => toggleAccordion('deployConfigService')}
            >
                <div>
                    <label htmlFor="deploy-mode" className="text-[#CCCCCC] text-sm block mb-2">Modo</label>
                    <select id="deploy-mode" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" value={deployMode} onChange={(e) => setDeployMode(e.target.value)}>
                        <option value="replicated">Replicated</option>
                        <option value="global">Global</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="deploy-replicas" className="text-[#CCCCCC] text-sm block mb-2">Réplicas</label>
                    <input type="number" id="deploy-replicas" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" value={deployReplicas} onChange={(e) => setDeployReplicas(parseInt(e.target.value))} min="0" />
                </div>
                {/* Mais campos de configuração de deploy podem ser adicionados aqui seguindo o padrão */}
            </AccordionItem>

            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={onClose}>Cancelar</button>
                <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">Salvar</button>
            </div>
        </form>
    );
};
