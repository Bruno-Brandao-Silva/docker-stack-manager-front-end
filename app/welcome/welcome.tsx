import React, { useState, useEffect, type ReactNode } from 'react';

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
}

const DataTable = <T extends { id?: string | number }>({ headers, data, onRowClick, renderCell, renderActions, pagination }: DataTableProps<T>) => {
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
            key={item.id || rowIndex}
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
  clientEnvVars: EnvVar[];
  setClientEnvVars: React.Dispatch<React.SetStateAction<EnvVar[]>>;
}

const ClientFormModalContent: React.FC<ClientFormModalContentProps> = ({ isEditMode, onClose, clientEnvVars, setClientEnvVars }) => {
  const handleClientEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
    setClientEnvVars(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addClientEnvVar = () => setClientEnvVars(prev => [...prev, { key: '', value: '' }]);
  const removeClientEnvVar = (index: number) => setClientEnvVars(prev => prev.filter((_, i) => i !== index));

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="client-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
        <input type="text" id="client-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome do Cliente" required />
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
        <input type="text" id="client-folder-path" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="/var/docker/clients/nome-cliente" />
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
}

const StackFormModalContent: React.FC<StackFormModalContentProps> = ({ isEditMode, onClose }) => {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="stack-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
        <input type="text" id="stack-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome da Stack" required />
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

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="service-name" className="text-[#CCCCCC] text-sm block mb-2">Nome <span className="text-red-500">*</span></label>
        <input type="text" id="service-name" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Nome do Serviço" required />
        <p className="text-[#FF5555] text-sm mt-1 hidden">O nome do serviço é obrigatório.</p>
      </div>
      <div>
        <label htmlFor="service-image" className="text-[#CCCCCC] text-sm block mb-2">Imagem <span className="text-red-500">*</span></label>
        <input type="text" id="service-image" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: nginx:latest" required />
        <p className="text-[#FF5555] text-sm mt-1 hidden">A imagem é obrigatória.</p>
      </div>

      <AccordionItem
        title="Configuração de Build"
        isOpen={accordionStates.buildConfig}
        onToggle={() => toggleAccordion('buildConfig')}
      >
        <div>
          <label htmlFor="build-context" className="text-[#CCCCCC] text-sm block mb-2">Context</label>
          <input type="text" id="build-context" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="./app" />
        </div>
        <div>
          <label htmlFor="build-dockerfile" className="text-[#CCCCCC] text-sm block mb-2">Dockerfile</label>
          <input type="text" id="build-dockerfile" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Dockerfile" />
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
          <input type="text" id="service-command" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: npm start" />
        </div>
        <div>
          <label htmlFor="service-entrypoint" className="text-[#CCCCCC] text-sm block mb-2">Entrypoint</label>
          <input type="text" id="service-entrypoint" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" placeholder="Ex: /usr/bin/entrypoint.sh" />
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
          <select id="deploy-mode" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50">
            <option value="replicated">Replicated</option>
            <option value="global">Global</option>
          </select>
        </div>
        <div>
          <label htmlFor="deploy-replicas" className="text-[#CCCCCC] text-sm block mb-2">Réplicas</label>
          <input type="number" id="deploy-replicas" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-full box-border placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" defaultValue="1" min="0" />
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
  onViewClientDetail: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onViewClientDetail }) => (
  <div id="dashboard-screen">
    <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Clientes cadastrados</p>
        <span className="text-5xl font-bold text-white">12</span>
      </div>
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Stacks cadastradas</p>
        <span className="text-5xl font-bold text-white">25</span>
      </div>
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
        <p className="text-lg text-gray-400 mb-2">Serviços cadastrados</p>
        <span className="text-5xl font-bold text-white">78</span>
      </div>
    </div>

    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-4">Status dos Contêineres</h3>
      <DataTable
        headers={[
          { key: 'client', label: 'Cliente' },
          { key: 'status', label: 'Status Compose' },
          { key: 'activeContainers', label: 'Contêineres Ativos' },
          { key: 'lastUpdate', label: 'Última Atualização' },
        ]}
        data={[
          { id: 'client-a', client: 'Cliente A', status: 'UP', activeContainers: 5, lastUpdate: '23/05/2024 10:30' },
          { id: 'client-b', client: 'Cliente B', status: 'DOWN', activeContainers: 0, lastUpdate: '23/05/2024 09:15' },
          { id: 'client-c', client: 'Cliente C', status: 'UP', activeContainers: 8, lastUpdate: '23/05/2024 11:00' },
          { id: 'client-d', client: 'Cliente D', status: 'UP', activeContainers: 3, lastUpdate: '23/05/2024 11:45' },
        ]}
        onRowClick={onViewClientDetail}
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
      />
    </div>
  </div>
);

// --- Componente: ClientListContent ---
interface ClientListContentProps {
  onViewClientDetail: () => void;
  onOpenClientModal: (editMode: boolean) => void;
}

const ClientListContent: React.FC<ClientListContentProps> = ({ onViewClientDetail, onOpenClientModal }) => (
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
        { key: 'id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome' },
        { key: 'stacks', label: 'Qtd. Stacks' },
        { key: 'status', label: 'Status Compose' },
        { key: 'lastUpdate', label: 'Última Atualização' },
      ]}
      data={[
        { id: '5eb7cf...d975', name: 'Cliente Alfa', stacks: 3, status: 'UP', lastUpdate: '23/05/2024 10:30' },
        { id: 'a1b2c3...d4e5', name: 'Cliente Beta', stacks: 1, status: 'DOWN', lastUpdate: '22/05/2024 18:00' },
        { id: 'f6g7h8...i9j0', name: 'Cliente Gama', stacks: 5, status: 'UP', lastUpdate: '23/05/2024 11:00' },
      ]}
      onRowClick={onViewClientDetail}
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
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenClientModal(true); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={(e) => e.stopPropagation()}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
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
  onOpenClientModal: (editMode: boolean) => void;
  onViewServiceDetail: () => void;
  accordionStates: { [key: string]: boolean };
  toggleAccordion: (panelId: string) => void;
}

const ClientDetailContent: React.FC<ClientDetailContentProps> = ({ onOpenClientModal, onViewServiceDetail, accordionStates, toggleAccordion }) => (
  <div id="client-detail-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold text-white">Cliente Alfa</h2>
      <div className="flex space-x-3">
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenClientModal(true)}>
          <i className="fas fa-edit mr-2"></i> Editar Cliente
        </button>
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
          <i className="fas fa-trash-alt mr-2"></i> Deletar Cliente
        </button>
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">
          <i className="fas fa-rocket mr-2"></i> Deploy
        </button>
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none">
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
            <p><span className="text-[#CCCCCC] text-sm block mb-1">ID:</span> <span className="font-mono text-gray-400">5eb7cfd7-a1b2-4c3d-9e0f-d975e6f8a0b1</span></p>
            <p><span className="text-[#CCCCCC] text-sm block mb-1">Folder Path:</span> <span className="font-mono text-gray-400">/var/docker/clients/cliente-alfa</span></p>
            <div>
              <span className="text-[#CCCCCC] text-sm block mb-2">Variáveis de Ambiente:</span>
              <table className="w-full text-sm mt-1">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 rounded-tl-md">Chave</th>
                    <th className="p-2 rounded-tr-md">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800">
                    <td className="p-2 font-mono">PORT</td>
                    <td className="p-2 font-mono">3000</td>
                  </tr>
                  <tr className="bg-gray-800">
                    <td className="p-2 font-mono">DB_HOST</td>
                    <td className="p-2 font-mono">localhost</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p><span className="text-[#CCCCCC] text-sm block mb-1">Criado em:</span> <span>2024-05-20 14:00:00</span></p>
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Stacks Associadas</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#06B6D4] text-white cursor-pointer hover:opacity-80">Stack Frontend</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#06B6D4] text-white cursor-pointer hover:opacity-80">Stack Backend</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#06B6D4] text-white cursor-pointer hover:opacity-80">Stack Database</span>
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
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#22C55E] text-white">UP</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none"><i className="fas fa-play mr-2"></i> UP</button>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none"><i className="fas fa-stop mr-2"></i> DOWN</button>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none"><i className="fas fa-sync-alt mr-2"></i> RESTART</button>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none"><i className="fas fa-skull-crossbones mr-2"></i> KILL</button>
          </div>
          <div className="mb-4">
            <label className="text-[#CCCCCC] text-sm block mb-2">Scale Serviço:</label>
            <div className="flex space-x-2">
              <select className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base flex-grow placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50">
                <option>Serviço Web</option>
                <option>Serviço API</option>
              </select>
              <input type="number" defaultValue="1" min="0" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-20 text-center placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
              <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none"><i className="fas fa-arrows-alt-v"></i> Aplicar</button>
            </div>
          </div>
          <div>
            <label className="text-[#CCCCCC] text-sm block mb-2">Exec Comando:</label>
            <div className="flex space-x-2">
              <input type="text" placeholder="Ex: bash" className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base flex-grow font-mono placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
              <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none"><i className="fas fa-terminal"></i> Enviar</button>
            </div>
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Logs em Tempo Real</h3>
          <div className="bg-gray-900 rounded-md p-4 h-64 overflow-y-auto font-mono text-sm text-gray-300">
            <pre>
              [web_1] Starting web service...
              [db_1] Database connected.
              [web_1] Server listening on port 3000.
              [api_1] API service online.
              [web_1] Request GET / from 192.168.1.100
              [db_1] Query executed successfully.
              [api_1] Error: Unauthorized access.
              [web_1] Request GET /users from 192.168.1.101
              [api_1] Data fetched.
              [db_1] Connection closed.
              [web_1] Service shutting down...
            </pre>
          </div>
          <div className="flex justify-end mt-4">
            <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none"><i className="fas fa-sync-alt mr-2"></i> Atualizar</button>
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
              <tr>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">cliente-alfa_web_1</td>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">nginx:latest</td>
                <td className="p-4 border-b border-[#2E2E2E]"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#22C55E] text-white">Running</span></td>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">0.0.0.0:8080&gt;80/tcp</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">cliente-alfa_api_1</td>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">node:18</td>
                <td className="p-4 border-b border-[#2E2E2E]"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#22C55E] text-white">Running</span></td>
                <td className="p-4 border-b border-[#2E2E2E] font-mono">0.0.0.0:3000&gt;3000/tcp</td>
              </tr>
              <tr>
                <td className="p-4 font-mono">cliente-alfa_db_1</td>
                <td className="p-4 font-mono">postgres:14</td>
                <td className="p-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase bg-[#22C55E] text-white">Running</span></td>
                <td className="p-4 font-mono">5432/tcp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// --- Componente: StackListContent ---
interface StackListContentProps {
  onViewStackDetail: () => void;
  onOpenStackModal: (editMode: boolean) => void;
}

const StackListContent: React.FC<StackListContentProps> = ({ onViewStackDetail, onOpenStackModal }) => (
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
        { key: 'id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome da Stack' },
        { key: 'services', label: 'Qtd. Serviços' },
        { key: 'createdAt', label: 'Criado Em' },
      ]}
      data={[
        { id: 'stack-a1b2...c3d4', name: 'Stack Frontend', services: 4, createdAt: '20/05/2024 10:00' },
        { id: 'stack-e5f6...g7h8', name: 'Stack Backend', services: 6, createdAt: '18/05/2024 15:30' },
        { id: 'stack-i9j0...k1l2', name: 'Stack Database', services: 2, createdAt: '19/05/2024 09:00' },
      ]}
      onRowClick={onViewStackDetail}
      renderCell={(item, key) => item[key as keyof typeof item]}
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenStackModal(true); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={(e) => e.stopPropagation()}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
    />
  </div>
);

// --- Componente: StackDetailContent ---
interface StackDetailContentProps {
  onOpenStackModal: (editMode: boolean) => void;
  onOpenServiceModal: (editMode: boolean) => void;
  onViewServiceDetail: () => void;
}

const StackDetailContent: React.FC<StackDetailContentProps> = ({ onOpenStackModal, onOpenServiceModal, onViewServiceDetail }) => (
  <div id="stack-detail-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Stack Frontend</h2>
      <div className="flex space-x-3">
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenStackModal(true)}>
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
          { key: 'status', label: 'Status' },
        ]}
        data={[
          { id: 'svc-nginx', name: 'Serviço Nginx', image: 'nginx:latest', status: 'Ativo' },
          { id: 'svc-react', name: 'Serviço React App', image: 'my-react-app:1.0', status: 'Ativo' },
        ]}
        onRowClick={onViewServiceDetail}
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
          <button className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); onViewServiceDetail(); }}><i className="fas fa-search"></i></button>
        )}
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

// --- Componente: ServiceListContent ---
interface ServiceListContentProps {
  onViewServiceDetail: () => void;
  onOpenServiceModal: (editMode: boolean) => void;
}

const ServiceListContent: React.FC<ServiceListContentProps> = ({ onViewServiceDetail, onOpenServiceModal }) => (
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
        { key: 'id', label: 'ID', className: 'font-mono text-gray-400' },
        { key: 'name', label: 'Nome do Serviço' },
        { key: 'image', label: 'Imagem', className: 'font-mono' },
        { key: 'dependencies', label: 'Dependências' },
        { key: 'createdAt', label: 'Criado Em' },
      ]}
      data={[
        { id: 'svc-1a2b...3c4d', name: 'Serviço Autenticação', image: 'auth-api:2.0', dependencies: 1, createdAt: '15/05/2024 08:00' },
        { id: 'svc-5e6f...7g8h', name: 'Serviço Pagamentos', image: 'payments-worker:1.5', dependencies: 2, createdAt: '14/05/2024 16:45' },
      ]}
      onRowClick={onViewServiceDetail}
      renderCell={(item, key) => item[key as keyof typeof item]}
      renderActions={(item) => (
        <>
          <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenServiceModal(true); }}><i className="fas fa-edit"></i></button>
          <button className="text-gray-400 hover:text-red-500" onClick={(e) => e.stopPropagation()}><i className="fas fa-trash-alt"></i></button>
        </>
      )}
    />
  </div>
);

// --- Componente: ServiceDetailContent ---
interface ServiceDetailContentProps {
  onOpenServiceModal: (editMode: boolean) => void;
  onViewServiceDetail: () => void; // For dependency links
  accordionStates: { [key: string]: boolean };
  toggleAccordion: (panelId: string) => void;
}

const ServiceDetailContent: React.FC<ServiceDetailContentProps> = ({ onOpenServiceModal, onViewServiceDetail, accordionStates, toggleAccordion }) => (
  <div id="service-detail-screen">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Serviço Autenticação</h2>
      <div className="flex space-x-3">
        <button className="inline-flex items-center justify-center px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none" onClick={() => onOpenServiceModal(true)}>
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
          <p className="font-mono text-white">auth-api</p>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Imagem:</p>
          <p className="font-mono text-white">auth-api:2.0</p>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Build:</p>
          <div className="bg-gray-800 p-3 rounded-md text-sm font-mono">
            <p><span className="text-gray-400">Context:</span> ./auth-service</p>
            <p><span className="text-gray-400">Dockerfile:</span> Dockerfile.prod</p>
            <p><span className="text-gray-400">Args:</span></p>
            <ul className="list-disc list-inside ml-4">
              <li>NODE_ENV=production</li>
            </ul>
          </div>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Comando:</p>
          <p className="font-mono text-white">npm start</p>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Portas:</p>
          <ul className="list-disc list-inside ml-4 font-mono text-white">
            <li>8080:3000</li>
          </ul>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Variáveis de Ambiente:</p>
          <table className="w-full text-sm mt-1">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 rounded-tl-md">Chave</th>
                <th className="p-2 rounded-tr-md">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-800">
                <td className="p-2 font-mono">JWT_SECRET</td>
                <td className="p-2 font-mono">super_secret_key</td>
              </tr>
            </tbody>
          </table>
        </div>
      </AccordionItem>

      <AccordionItem
        title="Configuração de Deploy"
        isOpen={accordionStates.deployConfig}
        onToggle={() => toggleAccordion('deployConfig')}
      >
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Modo:</p>
          <p className="font-mono text-white">replicated</p>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Réplicas:</p>
          <p className="font-mono text-white">3</p>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Recursos:</p>
          <div className="bg-gray-800 p-3 rounded-md text-sm font-mono">
            <p><span className="text-gray-400">Limits:</span> cpu=0.5, memory=512M</p>
            <p><span className="text-gray-400">Reservations:</span> cpu=0.2, memory=128M</p>
          </div>
        </div>
        <div>
          <p className="text-[#CCCCCC] text-sm block mb-1">Política de Reinício:</p>
          <p className="font-mono text-white">on-failure</p>
        </div>
      </AccordionItem>

      <AccordionItem
        title="Dependências"
        isOpen={accordionStates.dependencies}
        onToggle={() => toggleAccordion('dependencies')}
      >
        <p className="font-mono text-white cursor-pointer hover:underline" onClick={onViewServiceDetail}>db-service</p>
        <p className="font-mono text-white cursor-pointer hover:underline" onClick={onViewServiceDetail}>cache-service</p>
      </AccordionItem>
    </div>
  </div>
);

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

  // State for dynamic form fields in modals
  const [clientEnvVars, setClientEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }]);
  const [buildArgs, setBuildArgs] = useState<EnvVar[]>([]);
  const [serviceEnvVars, setServiceEnvVars] = useState<EnvVar[]>([]);
  const [servicePorts, setServicePorts] = useState<PortMapping[]>([]);
  const [serviceVolumes, setServiceVolumes] = useState<VolumeMapping[]>([]);


  // Function to show a specific screen and update sidebar active state
  const showScreen = (screenId: ScreenId) => {
    setActiveScreen(screenId);
  };

  // Function to open a modal
  const openModal = (modalId: 'client-modal' | 'stack-modal' | 'service-modal', editMode: boolean = false) => {
    setIsModalEditMode(editMode);
    if (modalId === 'client-modal') {
      setIsClientModalOpen(true);
      setClientEnvVars([{ key: '', value: '' }]); // Reset for new/edit
    } else if (modalId === 'stack-modal') {
      setIsStackModalOpen(true);
    } else if (modalId === 'service-modal') {
      setIsServiceModalOpen(true);
      // Reset dynamic fields for service modal when opening
      setBuildArgs([]);
      setServiceEnvVars([]);
      setServicePorts([]);
      setServiceVolumes([]);
    }
  };

  // Function to close a modal
  const closeModal = (modalId: 'client-modal' | 'stack-modal' | 'service-modal') => {
    if (modalId === 'client-modal') {
      setIsClientModalOpen(false);
    } else if (modalId === 'stack-modal') {
      setIsStackModalOpen(false);
    } else if (modalId === 'service-modal') {
      setIsServiceModalOpen(false);
    }
  };

  // Function to toggle accordion panels
  const toggleAccordion = (panelId: string) => {
    setAccordionStates(prevState => ({
      ...prevState,
      [panelId]: !prevState[panelId],
    }));
  };

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
          {activeScreen === 'dashboard' && <DashboardContent onViewClientDetail={() => showScreen('client-detail')} />}
          {activeScreen === 'clients' && <ClientListContent onViewClientDetail={() => showScreen('client-detail')} onOpenClientModal={(editMode) => openModal('client-modal', editMode)} />}
          {activeScreen === 'client-detail' && <ClientDetailContent onOpenClientModal={(editMode) => openModal('client-modal', editMode)} onViewServiceDetail={() => showScreen('service-detail')} accordionStates={accordionStates} toggleAccordion={toggleAccordion} />}
          {activeScreen === 'stacks' && <StackListContent onViewStackDetail={() => showScreen('stack-detail')} onOpenStackModal={(editMode) => openModal('stack-modal', editMode)} />}
          {activeScreen === 'stack-detail' && <StackDetailContent onOpenStackModal={(editMode) => openModal('stack-modal', editMode)} onOpenServiceModal={(editMode) => openModal('service-modal', editMode)} onViewServiceDetail={() => showScreen('service-detail')} />}
          {activeScreen === 'services' && <ServiceListContent onViewServiceDetail={() => showScreen('service-detail')} onOpenServiceModal={(editMode) => openModal('service-modal', editMode)} />}
          {activeScreen === 'service-detail' && <ServiceDetailContent onOpenServiceModal={(editMode) => openModal('service-modal', editMode)} onViewServiceDetail={() => showScreen('service-detail')} accordionStates={accordionStates} toggleAccordion={toggleAccordion} />}
          {activeScreen === 'settings' && <SettingsContent />}
        </div>
      </div>

      {/* Modals */}
      <Modal id="client-modal" title={isModalEditMode ? 'Editar Cliente' : 'Criar Cliente'} isOpen={isClientModalOpen} onClose={() => closeModal('client-modal')} isEditMode={isModalEditMode}>
        <ClientFormModalContent
          isEditMode={isModalEditMode}
          onClose={() => closeModal('client-modal')}
          clientEnvVars={clientEnvVars}
          setClientEnvVars={setClientEnvVars}
        />
      </Modal>

      <Modal id="stack-modal" title={isModalEditMode ? 'Editar Stack' : 'Criar Stack'} isOpen={isStackModalOpen} onClose={() => closeModal('stack-modal')} isEditMode={isModalEditMode}>
        <StackFormModalContent
          isEditMode={isModalEditMode}
          onClose={() => closeModal('stack-modal')}
        />
      </Modal>

      <Modal id="service-modal" title={isModalEditMode ? 'Editar Serviço' : 'Criar Serviço'} isOpen={isServiceModalOpen} onClose={() => closeModal('service-modal')} isEditMode={isModalEditMode}>
        <ServiceFormModalContent
          isEditMode={isModalEditMode}
          onClose={() => closeModal('service-modal')}
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
