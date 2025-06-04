import React, { useState, useEffect, type ReactNode, useCallback } from 'react';
import { Api, type ClientOutput, type StackOutput, type ServiceOutput, type ClientInput, type ClientUpdate, type StackInput, type StackUpdate, type ServiceInput, type ServiceUpdate } from '../api';
// Define types for better type checking with TypeScript
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

// --- Componente: Sidebar ---
interface SidebarProps {
  activeScreen: ScreenId;
  onNavigate: (screenId: ScreenId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { id: 'clients', icon: 'fas fa-users', label: 'Clientes' },
    { id: 'stacks', icon: 'fas fa-layer-group', label: 'Stacks' },
    { id: 'services', icon: 'fas fa-cubes', label: 'Serviços' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Configurações' },
  ];

  return (
    <div className="w-[200px] bg-[#1E1E1E] p-4 shadow-lg flex flex-col fixed h-full z-50
                    md:w-[200px] md:h-full md:flex-col md:shadow-lg
                    sm:w-full sm:h-auto sm:relative sm:flex-row sm:justify-around sm:p-2 sm:border-b sm:border-[#2E2E2E]">
      {sidebarItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center p-3 mb-2 rounded-md text-[#CCCCCC] cursor-pointer transition-colors duration-200
                      hover:bg-[#2A2A2A] hover:text-white
                      ${activeScreen === item.id || (item.id === 'clients' && activeScreen === 'client-detail') || (item.id === 'stacks' && activeScreen === 'stack-detail') || (item.id === 'services' && activeScreen === 'service-detail') ? 'bg-[#06B6D4] text-white' : ''}
                      sm:flex-col sm:text-center sm:p-2 sm:text-xs`}
          onClick={() => onNavigate(item.id as ScreenId)}
        >
          <i className={`${item.icon} mr-3 sm:mr-0 sm:mb-1 text-lg`}></i>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Componente: Topbar ---
const Topbar: React.FC = () => {
  return (
    <div className="bg-[#1E1E1E] p-4 px-8 flex justify-between items-center shadow-lg z-40">
      <div className="font-jetbrains-mono font-bold text-2xl text-[#06B6D4]">Docker Stack Manager</div>
      <div className="text-2xl text-[#CCCCCC] cursor-pointer">
        <i className="fas fa-user-circle"></i>
      </div>
    </div>
  );
};

// --- Componente: DataTable (Genérico) ---
interface DataTableProps<T> {
  headers: { key: string; label: string; className?: string }[];
  data: T[];
  onRowClick?: (item: T) => void;
  renderCell: (item: T, key: string) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  pagination?: ReactNode;
  loading?: boolean;
  error?: string | null;
}

const DataTable = <T extends { _id?: string | number }>({ headers, data, onRowClick, renderCell, renderActions, pagination, loading, error }: DataTableProps<T>) => {
  if (loading) {
    return <div className="text-center text-gray-400 py-8">Carregando dados...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Erro ao carregar dados: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-8">Nenhum dado encontrado.</div>;
  }

  return (
    <table className="w-full border-collapse mt-6 bg-[#1E1E1E] rounded-lg overflow-hidden">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header.key} className={`p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm ${header.className || ''}`}>
              {header.label}
            </th>
          ))}
          {renderActions && <th className="p-4 text-left bg-[#2A2A2A] text-white font-semibold text-sm">Ações</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr
            key={item._id || rowIndex}
            className="transition-colors duration-200 hover:bg-[#2A2A2A] cursor-pointer"
            onClick={() => onRowClick && onRowClick(item)}
          >
            {headers.map((header) => (
              <td key={header.key} className={`p-4 border-b border-[#2E2E2E] ${header.className || ''}`}>
                {renderCell(item, header.key)}
              </td>
            ))}
            {renderActions && <td className="p-4 border-b border-[#2E2E2E]">{renderActions(item)}</td>}
          </tr>
        ))}
      </tbody>
      {pagination && (
        <tfoot>
          <tr>
            <td colSpan={headers.length + (renderActions ? 1 : 0)} className="p-4">
              {pagination}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

// --- Componente: AccordionItem ---
interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className={`mb-4 border border-[#2E2E2E] rounded-lg overflow-hidden ${isOpen ? 'active' : ''}`}>
      <div className="bg-[#2A2A2A] p-4 px-6 cursor-pointer flex justify-between items-center font-semibold text-white transition-colors duration-200 hover:bg-[#2E2E2E]" onClick={onToggle}>
        <h3>{title}</h3>
        <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
      </div>
      <div className={`p-4 px-6 bg-[#1E1E1E] space-y-3 ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

// --- Componente: Modal (Genérico) ---
interface ModalProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isEditMode?: boolean; // Optional prop for modal title logic
}

const Modal: React.FC<ModalProps> = ({ id, title, isOpen, onClose, children, isEditMode }) => {
  if (!isOpen) return null;

  return (
    <div id={id} className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000] opacity-100 visible transition-opacity duration-300 ease-in-out">
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-8 w-[90%] max-w-[600px] shadow-2xl translate-y-0 transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2E2E2E]">
          <h3 className="text-2xl text-white">{title}</h3>
          <button className="bg-none border-none text-3xl text-[#CCCCCC] cursor-pointer transition-colors duration-200 hover:text-white" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Componente: DynamicInputGroup (para EnvVars, Args, Ports, Volumes) ---
interface DynamicInputGroupProps<T> {
  label: string;
  items: T[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, value: string, field?: keyof T) => void;
  placeholderKey?: string;
  placeholderValue?: string;
  isKeyValue?: boolean; // True for EnvVar, Args; false for Ports, Volumes
}

const DynamicInputGroup = <T extends EnvVar | PortMapping | VolumeMapping>({
  label,
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
  placeholderKey,
  placeholderValue,
  isKeyValue = false,
}: DynamicInputGroupProps<T>) => {
  return (
    <div>
      <label className="text-[#CCCCCC] text-sm block mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex space-x-2">
            {isKeyValue ? (
              <>
                <input
                  type="text"
                  placeholder={placeholderKey}
                  className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-1/2 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50"
                  value={(item as EnvVar).key}
                  onChange={(e) => onItemChange(index, e.target.value, 'key')}
                />
                <input
                  type="text"
                  placeholder={placeholderValue}
                  className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-1/2 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50"
                  value={(item as EnvVar).value}
                  onChange={(e) => onItemChange(index, e.target.value, 'value')}
                />
              </>
            ) : (
              <input
                type="text"
                placeholder={placeholderValue}
                className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base flex-grow placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50"
                value={(item as PortMapping | VolumeMapping).value}
                onChange={(e) => onItemChange(index, e.target.value)}
              />
            )}
            <button type="button" className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onRemoveItem(index)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none mt-2" onClick={onAddItem}>
        <i className="fas fa-plus mr-2"></i> {label.includes('Variável') ? 'Adicionar Variável' : label.includes('Portas') ? 'Adicionar Porta' : label.includes('Volumes') ? 'Adicionar Volume' : 'Adicionar Item'}
      </button>
    </div>
  );
};

// --- Componente: ClientFormModalContent ---
interface ClientFormModalContentProps {
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (clientData: ClientInput | ClientUpdate) => void;
  initialData?: ClientOutput;
  clientEnvVars: EnvVar[];
  setClientEnvVars: React.Dispatch<React.SetStateAction<EnvVar[]>>;
}

const ClientFormModalContent: React.FC<ClientFormModalContentProps> = ({ isEditMode, onClose, onSubmit, initialData, clientEnvVars, setClientEnvVars }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [folderPath, setFolderPath] = useState(initialData?.folder_path || '');
  // Stacks selection would need to fetch available stacks and manage their IDs

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
      // stacks: [] // Implement stack selection logic here
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

// --- Componente: StackFormModalContent ---
interface StackFormModalContentProps {
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (stackData: StackInput | StackUpdate) => void;
  initialData?: StackOutput;
}

const StackFormModalContent: React.FC<StackFormModalContentProps> = ({ isEditMode, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stackData: StackInput | StackUpdate = {
      name,
      // services: [] // Implement service selection logic here
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

// --- Componente: ServiceFormModalContent ---
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

const ServiceFormModalContent: React.FC<ServiceFormModalContentProps> = ({
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
      command: command ? command.split(' ') : undefined, // Assuming space-separated command
      entrypoint: entrypoint ? entrypoint.split(' ') : undefined,
      environment: Object.keys(serviceEnvVarsMap).length > 0 ? serviceEnvVarsMap : undefined,
      ports: servicePorts.map(p => p.value),
      volumes: serviceVolumes.map(v => v.value),
      deploy: {
        mode: deployMode,
        replicas: deployReplicas,
      },
      // Add other DockerServiceConfig fields as needed from the form
    };

    const serviceData: ServiceInput | ServiceUpdate = {
      docker_config: dockerConfig as any, // Type assertion for simplicity, refine as needed
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
        {/* More deploy config fields can be added here following the pattern */}
      </AccordionItem>

      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={onClose}>Cancelar</button>
        <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">Salvar</button>
      </div>
    </form>
  );
};

// --- Componente: DashboardContent ---
interface DashboardContentProps {
  onViewClientDetail: (clientId: string) => void;
  clients: ClientOutput[];
  stacks: StackOutput[];
  services: ServiceOutput[];
  loading: { clients: boolean; stacks: boolean; services: boolean };
  error: { clients: string | null; stacks: string | null; services: string | null };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onViewClientDetail, clients, stacks, services, loading, error }) => (
  <div id="dashboard-screen">
    <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Clientes cadastrados</p>
        {loading.clients ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{clients.length}</span>}
      </div>
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Stacks cadastradas</p>
        {loading.stacks ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{stacks.length}</span>}
      </div>
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Serviços cadastrados</p>
        {loading.services ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{services.length}</span>}
      </div>
    </div>

    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-4">Status dos Contêineres</h3>
      <DataTable
        headers={[
          { key: 'name', label: 'Cliente' },
          { key: 'status', label: 'Status Compose' },
          { key: 'activeContainers', label: 'Contêineres Ativos' },
          { key: 'lastUpdate', label: 'Última Atualização' },
        ]}
        data={clients.map(c => ({
          _id: c._id,
          name: c.name,
          status: c.deployment?.status === 'up' ? 'UP' : 'DOWN', // Mocked status based on deployment
          activeContainers: c.deployment?.status === 'up' ? Math.floor(Math.random() * 10) + 1 : 0, // Mocked active containers
          lastUpdate: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(c.created_at).toLocaleTimeString('pt-BR') : 'N/A',
        }))}
        onRowClick={(item) => item._id && onViewClientDetail(item._id as string)}
        renderCell={(item, key) => {
          if (key === 'status') {
            return (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'UP' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>
                {item.status}
              </span>
            );
          }
          return item[key as keyof typeof item];
        }}
        loading={loading.clients}
        error={error.clients}
      />
    </div>
  </div>
);

// --- Componente: ClientListContent ---
interface ClientListContentProps {
  onViewClientDetail: (clientId: string) => void;
  onOpenClientModal: (editMode: boolean, client?: ClientOutput) => void;
  clients: ClientOutput[];
  loading: boolean;
  error: string | null;
  onDeleteClient: (clientId: string) => Promise<void>;
}

const ClientListContent: React.FC<ClientListContentProps> = ({ onViewClientDetail, onOpenClientModal, clients, loading, error, onDeleteClient }) => (
  <div id="clients-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Lista de Clientes</h2>
      <div className="flex items-center space-x-4">
        <input type="text" placeholder="Buscar cliente..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
        <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenClientModal(false)}>
          <i className="fas fa-plus mr-2"></i> Novo Cliente
        </button>
      </div>
    </div>

    <DataTable
      headers={[
        { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome' },
        { key: 'stacksCount', label: 'Qtd. Stacks' },
        { key: 'status', label: 'Status Compose' },
        { key: 'lastUpdate', label: 'Última Atualização' },
      ]}
      data={clients.map(c => ({
        ...c,
        stacksCount: c.stacks?.length || 0,
        status: c.deployment?.status === 'up' ? 'UP' : 'DOWN', // Mocked status based on deployment
        lastUpdate: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(c.created_at).toLocaleTimeString('pt-BR') : 'N/A',
      }))}
      onRowClick={(item) => item._id && onViewClientDetail(item._id as string)}
      renderCell={(item, key) => {
        if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
        if (key === 'status') {
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'UP' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>
              {item.status}
            </span>
          );
        }
        return item[key as keyof typeof item];
      }}
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenClientModal(true, item); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteClient(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
      loading={loading}
      error={error}
      pagination={
        <div className="flex justify-center">
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none mr-2">Anterior</button>
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">1</button>
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none ml-2">Próximo</button>
        </div>
      }
    />
  </div>
);

// --- Componente: ClientDetailContent ---
interface ClientDetailContentProps {
  clientId: string | null;
  onOpenClientModal: (editMode: boolean, client?: ClientOutput) => void;
  onViewServiceDetail: (serviceId: string) => void;
  accordionStates: { [key: string]: boolean };
  toggleAccordion: (panelId: string) => void;
  token: string | null;
}

const ClientDetailContent: React.FC<ClientDetailContentProps> = ({ clientId, onOpenClientModal, onViewServiceDetail, accordionStates, toggleAccordion, token }) => {
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

      // Fetch Compose Status, Logs, PS (mocked data for display as API returns empty schema)
      const statusResponse = await Api.Compose.composeStatus(clientId, token);
      setComposeStatus(statusResponse.status || 'UP'); // Assuming statusResponse has a status field

      const logsResponse = await Api.Compose.composeLogs(clientId, token);
      setComposeLogs(logsResponse.logs || `[${new Date().toLocaleTimeString()}] Mocked logs for client ${clientId}...`);

      const psResponse = await Api.Compose.composePs(clientId, token);
      setComposePsData(psResponse.data || [ // Mocked data structure for ps
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
      // Re-fetch client details to update status after action
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
        {/* Left Column */}
        <div className="md:w-3/5 space-y-6">
          <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Informações Gerais</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-[#CCCCCC] text-sm block mb-1">ID:</span> <span className="font-mono text-gray-400">{client._id}</span></p>
              <p><span className="text-[#CCCCCC] text-sm block mb-1">Folder Path:</span> <span className="font-mono text-gray-400">{client.folder_path || 'N/A'}</span></p>
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
                    {stack.id} {/* In a real app, you'd fetch stack name */}
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

        {/* Right Column */}
        <div className="md:w-2/5 space-y-6">
          <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Compose Controls</h3>
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
              <label className="text-[#CCCCCC] text-sm block mb-2">Scale Serviço:</label>
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
              <label className="text-[#CCCCCC] text-sm block mb-2">Exec Comando:</label>
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
            <h3 className="text-xl font-semibold mb-4">Status de Contêineres</h3>
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

// --- Componente: StackListContent ---
interface StackListContentProps {
  onViewStackDetail: (stackId: string) => void;
  onOpenStackModal: (editMode: boolean, stack?: StackOutput) => void;
  stacks: StackOutput[];
  loading: boolean;
  error: string | null;
  onDeleteStack: (stackId: string) => Promise<void>;
}

const StackListContent: React.FC<StackListContentProps> = ({ onViewStackDetail, onOpenStackModal, stacks, loading, error, onDeleteStack }) => (
  <div id="stacks-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Lista de Stacks</h2>
      <div className="flex items-center space-x-4">
        <input type="text" placeholder="Buscar stack..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
        <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenStackModal(false)}>
          <i className="fas fa-plus mr-2"></i> Nova Stack
        </button>
      </div>
    </div>

    <DataTable
      headers={[
        { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome da Stack' },
        { key: 'servicesCount', label: 'Qtd. Serviços' },
        { key: 'createdAt', label: 'Criado Em' },
      ]}
      data={stacks.map(s => ({
        ...s,
        servicesCount: s.services?.length || 0,
        createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(s.created_at).toLocaleTimeString('pt-BR') : 'N/A',
      }))}
      onRowClick={(item) => item._id && onViewStackDetail(item._id as string)}
      renderCell={(item, key) => {
        if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
        return item[key as keyof typeof item];
      }}
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenStackModal(true, item); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteStack(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
      loading={loading}
      error={error}
    />
  </div>
);

// --- Componente: StackDetailContent ---
interface StackDetailContentProps {
  stackId: string | null;
  onOpenStackModal: (editMode: boolean, stack?: StackOutput) => void;
  onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
  onViewServiceDetail: (serviceId: string) => void;
  token: string | null;
}

const StackDetailContent: React.FC<StackDetailContentProps> = ({ stackId, onOpenStackModal, onOpenServiceModal, onViewServiceDetail, token }) => {
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

      // Fetch associated services (mocked if services are only IDs in stack output)
      if (fetchedStack.services && fetchedStack.services.length > 0) {
        // In a real app, you'd fetch each service by ID or have a dedicated endpoint
        const allServices = await Api.Services.listServices(token); // Fetch all and filter for demo
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
            { key: 'status', label: 'Status' }, // Mocked status
          ]}
          data={associatedServices.map(s => ({
            _id: s._id,
            name: s.docker_config.name,
            image: s.docker_config.image || 'N/A',
            status: 'Ativo' // Mocked status for associated services
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
          loading={loading} // Use stack loading state for this table
          error={error} // Use stack error state for this table
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

// --- Componente: ServiceListContent ---
interface ServiceListContentProps {
  onViewServiceDetail: (serviceId: string) => void;
  onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
  services: ServiceOutput[];
  loading: boolean;
  error: string | null;
  onDeleteService: (serviceId: string) => Promise<void>;
}

const ServiceListContent: React.FC<ServiceListContentProps> = ({ onViewServiceDetail, onOpenServiceModal, services, loading, error, onDeleteService }) => (
  <div id="services-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Lista de Serviços</h2>
      <div className="flex items-center space-x-4">
        <input type="text" placeholder="Buscar serviço..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
        <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenServiceModal(false)}>
          <i className="fas fa-plus mr-2"></i> Novo Serviço
        </button>
      </div>
    </div>

    <DataTable
      headers={[
        { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome do Serviço' },
        { key: 'image', label: 'Imagem', className: 'font-mono' },
        { key: 'dependenciesCount', label: 'Dependências' },
        { key: 'createdAt', label: 'Criado Em' },
      ]}
      data={services.map(s => ({
        ...s,
        name: s.docker_config.name,
        image: s.docker_config.image || 'N/A',
        dependenciesCount: Array.isArray(s.docker_config.depends_on) ? s.docker_config.depends_on.length : 0,
        createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(s.created_at).toLocaleTimeString('pt-BR') : 'N/A',
      }))}
      onRowClick={(item) => item._id && onViewServiceDetail(item._id as string)}
      renderCell={(item, key) => {
        if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
        return item[key as keyof typeof item];
      }}
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenServiceModal(true, item); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteService(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
      loading={loading}
      error={error}
    />
  </div>
);

// --- Componente: ServiceDetailContent ---
interface ServiceDetailContentProps {
  serviceId: string | null;
  onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
  onViewServiceDetail: (serviceId: string) => void; // For dependency links
  accordionStates: { [key: string]: boolean };
  toggleAccordion: (panelId: string) => void;
  token: string | null;
}

const ServiceDetailContent: React.FC<ServiceDetailContentProps> = ({ onOpenServiceModal, onViewServiceDetail, accordionStates, toggleAccordion, serviceId, token }) => {
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

// --- Componente: SettingsContent (Placeholder) ---
const SettingsContent: React.FC = () => (
  <div id="settings-screen">
    <h2 className="text-2xl font-semibold mb-6">Configurações</h2>
    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
      <p className="text-gray-400">Conteúdo das configurações em desenvolvimento.</p>
    </div>
  </div>
);


// --- Componente Principal: App ---
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
    dockerConfig: true, // Default open for Docker Config
    deployConfig: false,
    dependencies: false,
    buildConfig: false,
    commandEntrypoint: false,
    serviceEnvVars: false,
    portsVolumes: false,
    deployConfigService: false,
  });

  // API Data States
  const [clients, setClients] = useState<ClientOutput[]>([]);
  const [stacks, setStacks] = useState<StackOutput[]>([]);
  const [services, setServices] = useState<ServiceOutput[]>([]);

  // Loading States
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Error States
  const [errorClients, setErrorClients] = useState<string | null>(null);
  const [errorStacks, setErrorStacks] = useState<string | null>(null);
  const [errorServices, setErrorServices] = useState<string | null>(null);

  // Authentication Token (Placeholder - replace with actual auth logic)
  const [authToken, setAuthToken] = useState<string | null>('YOUR_AUTH_TOKEN_HERE'); // Replace with your actual JWT token

  // State for dynamic form fields in modals
  const [clientEnvVars, setClientEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }]);
  const [buildArgs, setBuildArgs] = useState<EnvVar[]>([]);
  const [serviceEnvVars, setServiceEnvVars] = useState<EnvVar[]>([]);
  const [servicePorts, setServicePorts] = useState<PortMapping[]>([]);
  const [serviceVolumes, setServiceVolumes] = useState<VolumeMapping[]>([]);


  // --- Fetching Functions ---
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

  // --- API Actions (Create, Update, Delete) ---
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
          setActiveScreen('clients'); // Navigate back to list if current client is deleted
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


  // --- Navigation & Modal Logic ---
  const showScreen = (screenId: ScreenId) => {
    setActiveScreen(screenId);
    // Reset selected IDs when navigating to a list screen
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
      setClientEnvVars([{ key: '', value: '' }]); // Reset for new/edit
    } else if (modalId === 'stack-modal') {
      setCurrentStackData(data as StackOutput);
      setIsStackModalOpen(true);
    } else if (modalId === 'service-modal') {
      setCurrentServiceData(data as ServiceOutput);
      setIsServiceModalOpen(true);
      // Reset dynamic fields for service modal when opening
      setBuildArgs([]);
      setServiceEnvVars([]);
      setServicePorts([]);
      setServiceVolumes([]);
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

  // --- Initial Data Fetch on Component Mount and Token Change ---
  useEffect(() => {
    if (authToken) {
      fetchClients();
      fetchStacks();
      fetchServices();
    } else {
      console.warn("Autenticação não disponível. Por favor, forneça um token JWT.");
      // Optionally, redirect to a login page or show a prominent message
    }
  }, [authToken, fetchClients, fetchStacks, fetchServices]);


  return (
    <div className="flex min-h-screen overflow-x-hidden font-inter bg-[#121212] text-[#EEEEEE]">
      {/* Sidebar */}
      <Sidebar activeScreen={activeScreen} onNavigate={showScreen} />

      {/* Main Content Area */}
      <div className="flex-grow ml-[200px] flex flex-col sm:ml-0 sm:pt-0">
        {/* Topbar */}
        <Topbar />

        {/* Screen Content Container */}
        <div className="p-8 flex-grow overflow-y-auto sm:p-4">
          {activeScreen === 'dashboard' && <DashboardContent
            onViewClientDetail={handleViewClientDetail}
            clients={clients}
            stacks={stacks}
            services={services}
            loading={{ clients: loadingClients, stacks: loadingStacks, services: loadingServices }}
            error={{ clients: errorClients, stacks: errorStacks, services: errorServices }}
          />}
          {activeScreen === 'clients' && <ClientListContent
            onViewClientDetail={handleViewClientDetail}
            onOpenClientModal={openModal}
            clients={clients}
            loading={loadingClients}
            error={errorClients}
            onDeleteClient={handleDeleteClient}
          />}
          {activeScreen === 'client-detail' && selectedClientId && <ClientDetailContent
            clientId={selectedClientId}
            onOpenClientModal={openModal}
            onViewServiceDetail={handleViewServiceDetail}
            accordionStates={accordionStates}
            toggleAccordion={toggleAccordion}
            token={authToken}
          />}
          {activeScreen === 'stacks' && <StackListContent
            onViewStackDetail={handleViewStackDetail}
            onOpenStackModal={openModal}
            stacks={stacks}
            loading={loadingStacks}
            error={errorStacks}
            onDeleteStack={handleDeleteStack}
          />}
          {activeScreen === 'stack-detail' && selectedStackId && <StackDetailContent
            stackId={selectedStackId}
            onOpenStackModal={openModal}
            onOpenServiceModal={openModal}
            onViewServiceDetail={handleViewServiceDetail}
            token={authToken}
          />}
          {activeScreen === 'services' && <ServiceListContent
            onViewServiceDetail={handleViewServiceDetail}
            onOpenServiceModal={openModal}
            services={services}
            loading={loadingServices}
            error={errorServices}
            onDeleteService={handleDeleteService}
          />}
          {activeScreen === 'service-detail' && selectedServiceId && <ServiceDetailContent
            serviceId={selectedServiceId}
            onOpenServiceModal={openModal}
            onViewServiceDetail={handleViewServiceDetail}
            accordionStates={accordionStates}
            toggleAccordion={toggleAccordion}
            token={authToken}
          />}
          {activeScreen === 'settings' && <SettingsContent />}
        </div>
      </div>

      {/* Modals */}
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
