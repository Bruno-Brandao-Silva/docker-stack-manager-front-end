// api.ts
// Este arquivo define as tipagens TypeScript para as entidades da API
// e fornece funções para interagir com o backend Docker Stack Manager.

const API_BASE_URL = 'http://localhost:3000';

// ===========================================================================
// TIPAGENS DA API (Baseadas no OpenAPI Specification)
// ===========================================================================

// Shared Utility Types
export type Optional<T> = T | null | undefined;
export type StringOrStringArray = Optional<string | string[]>;
export type StringOrNumber = Optional<string | number>;
export type StringStringRecord = Optional<Record<string, string>>;
export type StringStringNumberRecord = Optional<Record<string, string | number>>;

// --- BuildConfig ---
export interface BuildConfig {
    context?: Optional<string>;
    dockerfile?: Optional<string>;
    args?: StringStringRecord;
    target?: Optional<string>;
    cache_from?: StringOrStringArray;
    labels?: StringStringRecord;
    network?: Optional<string>;
    shm_size?: StringOrNumber;
    extra_hosts?: StringOrStringArray;
    isolation?: Optional<string>;
    no_cache?: Optional<boolean>;
    pull?: Optional<boolean>;
    secrets?: StringOrStringArray;
    ssh?: StringOrStringArray;
    platforms?: StringOrStringArray;
}

// --- HealthcheckConfig ---
export interface HealthcheckConfigInput {
    test: string | string[]; // Required in input
    interval?: Optional<string>;
    timeout?: Optional<string>;
    retries?: Optional<number>;
    start_period?: Optional<string>;
}

export interface HealthcheckConfigOutput {
    test: string | string[]; // Required in output
    interval?: Optional<string>;
    timeout?: Optional<string>;
    retries?: Optional<number>;
    start_period?: Optional<string>;
}

// --- LoggingConfig ---
export interface LoggingConfig {
    driver?: Optional<string>;
    options?: StringStringRecord;
}

// --- DeployConfig ---
export interface DeployResources {
    limits?: StringStringNumberRecord;
    reservations?: StringStringNumberRecord;
}

export interface DeployRestartPolicy {
    condition?: Optional<string>;
    delay?: Optional<string>;
    max_attempts?: Optional<number>;
    window?: Optional<string>;
}

export interface DeployPlacement {
    constraints?: StringOrStringArray;
    preferences?: Optional<Record<string, string>[]>; // Array of objects with additional properties
    max_replicas_per_node?: Optional<number>;
}

export interface DeployUpdateConfig {
    parallelism?: Optional<number>;
    delay?: Optional<string>;
    failure_action?: Optional<string>;
    monitor?: Optional<string>;
    max_failure_ratio?: Optional<number>;
    order?: Optional<string>;
}

export interface DeployRollbackConfig {
    parallelism?: Optional<number>;
    delay?: Optional<string>;
    failure_action?: Optional<string>;
    monitor?: Optional<string>;
    max_failure_ratio?: Optional<number>;
    order?: Optional<string>;
}

export interface DeployConfig {
    mode?: Optional<string>;
    replicas?: Optional<number>;
    endpoint_mode?: Optional<string>;
    labels?: StringStringRecord;
    resources?: Optional<DeployResources>;
    restart_policy?: Optional<DeployRestartPolicy>;
    placement?: Optional<DeployPlacement>;
    update_config?: Optional<DeployUpdateConfig>;
    rollback_config?: Optional<DeployRollbackConfig>;
}

// --- UlimitConfig ---
export interface UlimitConfigInput {
    name: Optional<string>;
    soft?: Optional<number>;
    hard?: Optional<number>;
}

export interface UlimitConfigOutput {
    name: Optional<string>;
    soft?: Optional<number>;
    hard?: Optional<number>;
}


// --- DockerServiceConfig ---
// Note: The OpenAPI spec has app__models__service__DockerServiceConfig-Input and app__schemas__service__DockerServiceConfig.
// Assuming app__models__service__DockerServiceConfig-Input is for creation/full input,
// and app__schemas__service__DockerServiceConfig is for update/partial input.
// DockerServiceConfig-Output is for the full output.

export type DockerServiceDependsOn = Optional<string[] | Record<string, Record<string, string>>>;
export type DockerServicePorts = Optional<(string | Record<string, string | number>)[]>;
export type DockerServiceLabels = Optional<string[] | Record<string, string>>;
export type DockerServiceNetworks = Optional<string[] | Record<string, Record<string, string>>>;
export type DockerServiceSecrets = Optional<(string | Record<string, string>)[]>;
export type DockerServiceVolumes = Optional<(string | Record<string, string | Record<string, string>>)[]>; // Complex type, string or object with optional sub-properties

export interface DockerServiceConfigInput {
    name: string;
    build?: Optional<string | BuildConfig>;
    image?: Optional<string>;
    command?: StringOrStringArray;
    container_name?: Optional<string>;
    depends_on?: DockerServiceDependsOn;
    deploy?: Optional<DeployConfig>;
    devices?: StringOrStringArray;
    dns?: StringOrStringArray;
    dns_search?: StringOrStringArray;
    entrypoint?: StringOrStringArray;
    environment?: StringStringRecord;
    env_file?: StringOrStringArray;
    expose?: StringOrStringArray;
    extends?: StringStringRecord;
    external_links?: StringOrStringArray;
    extra_hosts?: StringOrStringArray;
    healthcheck?: Optional<HealthcheckConfigInput>;
    hostname?: Optional<string>;
    ipc?: Optional<string>;
    labels?: DockerServiceLabels;
    links?: StringOrStringArray;
    logging?: Optional<LoggingConfig>;
    network_mode?: Optional<string>;
    networks?: DockerServiceNetworks;
    pid?: Optional<string>;
    ports?: DockerServicePorts;
    privileged?: Optional<boolean>;
    profiles?: StringOrStringArray;
    restart?: Optional<string>;
    secrets?: DockerServiceSecrets;
    security_opt?: StringOrStringArray;
    stdin_open?: Optional<boolean>;
    stop_grace_period?: Optional<string>;
    stop_signal?: Optional<string>;
    sysctls?: StringStringRecord;
    tmpfs?: StringOrStringArray;
    tty?: Optional<boolean>;
    ulimits?: Optional<Record<string, number | Record<string, number>> | UlimitConfigInput[]>; // This is a complex one. Can be map or array of UlimitConfigInput
    user?: Optional<string>;
    userns_mode?: Optional<string>;
    volumes?: DockerServiceVolumes;
    working_dir?: Optional<string>;
    configs?: Optional<(string | Record<string, string>)[]>;
    cap_add?: StringOrStringArray;
    cap_drop?: StringOrStringArray;
    cgroup_parent?: Optional<string>;
    cpu_shares?: Optional<number>;
    cpu_quota?: Optional<number>;
    cpus?: Optional<number>;
    cpuset?: Optional<string>;
    domainname?: Optional<string>;
    mac_address?: Optional<string>;
    mem_limit?: StringOrNumber;
    mem_reservation?: StringOrNumber;
    memswap_limit?: StringOrNumber;
    oom_kill_disable?: Optional<boolean>;
    oom_score_adj?: Optional<number>;
    read_only?: Optional<boolean>;
    shm_size?: StringOrNumber;
    volumes_from?: StringOrStringArray;
}

export interface DockerServiceConfigOutput {
    name: string;
    build?: Optional<string | BuildConfig>;
    image?: Optional<string>;
    command?: StringOrStringArray;
    container_name?: Optional<string>;
    depends_on?: DockerServiceDependsOn;
    deploy?: Optional<DeployConfig>;
    devices?: StringOrStringArray;
    dns?: StringOrStringArray;
    dns_search?: StringOrStringArray;
    entrypoint?: StringOrStringArray;
    environment?: StringStringRecord;
    env_file?: StringOrStringArray;
    expose?: StringOrStringArray;
    extends?: StringStringRecord;
    external_links?: StringOrStringArray;
    extra_hosts?: StringOrStringArray;
    healthcheck?: Optional<HealthcheckConfigOutput>; // Output version of healthcheck
    hostname?: Optional<string>;
    ipc?: Optional<string>;
    labels?: DockerServiceLabels;
    links?: StringOrStringArray;
    logging?: Optional<LoggingConfig>;
    network_mode?: Optional<string>;
    networks?: DockerServiceNetworks;
    pid?: Optional<string>;
    ports?: DockerServicePorts;
    privileged?: Optional<boolean>;
    profiles?: StringOrStringArray;
    restart?: Optional<string>;
    secrets?: DockerServiceSecrets;
    security_opt?: StringOrStringArray;
    stdin_open?: Optional<boolean>;
    stop_grace_period?: Optional<string>;
    stop_signal?: Optional<string>;
    sysctls?: StringStringRecord;
    tmpfs?: StringOrStringArray;
    tty?: Optional<boolean>;
    ulimits?: Optional<Record<string, number | Record<string, number>> | UlimitConfigOutput[]>; // Output version of ulimits
    user?: Optional<string>;
    userns_mode?: Optional<string>;
    volumes?: DockerServiceVolumes;
    working_dir?: Optional<string>;
    configs?: Optional<(string | Record<string, string>)[]>;
    cap_add?: StringOrStringArray;
    cap_drop?: StringOrStringArray;
    cgroup_parent?: Optional<string>;
    cpu_shares?: Optional<number>;
    cpu_quota?: Optional<number>;
    cpus?: Optional<number>;
    cpuset?: Optional<string>;
    domainname?: Optional<string>;
    mac_address?: Optional<string>;
    mem_limit?: StringOrNumber;
    mem_reservation?: StringOrNumber;
    memswap_limit?: StringOrNumber;
    oom_kill_disable?: Optional<boolean>;
    oom_score_adj?: Optional<number>;
    read_only?: Optional<boolean>;
    shm_size?: StringOrNumber;
    volumes_from?: StringOrStringArray;
}

// This seems to be the one for ServiceUpdate's docker_config
export interface DockerServiceConfigUpdate {
    name?: Optional<string>;
    build?: Optional<string | BuildConfig>;
    image?: Optional<string>;
    command?: StringOrStringArray;
    container_name?: Optional<string>;
    depends_on?: DockerServiceDependsOn;
    deploy?: Optional<DeployConfig>;
    devices?: StringOrStringArray;
    dns?: StringOrStringArray;
    dns_search?: StringOrStringArray;
    entrypoint?: StringOrStringArray;
    environment?: StringStringRecord;
    env_file?: StringOrStringArray;
    expose?: StringOrStringArray;
    extends?: StringStringRecord;
    external_links?: StringOrStringArray;
    extra_hosts?: StringOrStringArray;
    healthcheck?: Optional<HealthcheckConfigInput>;
    hostname?: Optional<string>;
    ipc?: Optional<string>;
    labels?: DockerServiceLabels;
    links?: StringOrStringArray;
    logging?: Optional<LoggingConfig>;
    network_mode?: Optional<string>;
    networks?: DockerServiceNetworks;
    pid?: Optional<string>;
    ports?: DockerServicePorts;
    privileged?: Optional<boolean>;
    profiles?: StringOrStringArray;
    restart?: Optional<string>;
    secrets?: DockerServiceSecrets;
    security_opt?: StringOrStringArray;
    stdin_open?: Optional<boolean>;
    stop_grace_period?: Optional<string>;
    stop_signal?: Optional<string>;
    sysctls?: StringStringRecord;
    tmpfs?: StringOrStringArray;
    tty?: Optional<boolean>;
    ulimits?: Optional<Record<string, number | Record<string, number>> | UlimitConfigInput[]>;
    user?: Optional<string>;
    userns_mode?: Optional<string>;
    volumes?: DockerServiceVolumes;
    working_dir?: Optional<string>;
    configs?: Optional<(string | Record<string, string>)[]>;
    cap_add?: StringOrStringArray;
    cap_drop?: StringOrStringArray;
    cgroup_parent?: Optional<string>;
    cpu_shares?: Optional<number>;
    cpu_quota?: Optional<number>;
    cpus?: Optional<number>;
    cpuset?: Optional<string>;
    domainname?: Optional<string>;
    mac_address?: Optional<string>;
    mem_limit?: StringOrNumber;
    mem_reservation?: StringOrNumber;
    memswap_limit?: StringOrNumber;
    oom_kill_disable?: Optional<boolean>;
    oom_score_adj?: Optional<number>;
    read_only?: Optional<boolean>;
    shm_size?: StringOrNumber;
    volumes_from?: StringOrStringArray;
}


// --- File & Files ---
export interface File {
    name: string;
    path: string;
    hash_sha256: string;
    created_at?: Optional<string>;
    updated_at?: Optional<string>;
}

export interface Files {
    docker_compose?: Optional<File>;
    env_file?: Optional<File>;
    other_files?: File[];
}

// --- Deployment ---
export interface DeploymentInput {
    path: string;
    status: string;
    message?: Optional<string>;
    files?: Optional<Files>;
    created_at?: Optional<string>;
    updated_at?: Optional<string>;
}

export interface DeploymentOutput {
    path: string;
    status: string;
    message?: Optional<string>;
    files?: Optional<Files>;
    created_at?: Optional<string>;
    updated_at?: Optional<string>;
}

// --- Client ---
export interface ClientInput {
    _id?: Optional<string>; // MongoDB ObjectID
    name: string;
    stacks?: Optional<{ id: string; collection: string }[]>; // Array of references
    folder_path?: Optional<string>;
    environment?: StringStringRecord;
    deployment?: Optional<DeploymentInput>;
    created_at?: Optional<string>;
}

export interface ClientOutput {
    _id?: Optional<string>; // MongoDB ObjectID
    name: string;
    stacks?: Optional<{ id: string; collection: string }[]>; // Array of references
    folder_path?: Optional<string>;
    environment?: StringStringRecord;
    deployment?: Optional<DeploymentOutput>;
    created_at?: Optional<string>;
}

export interface ClientUpdate {
    name?: Optional<string>;
    stacks?: Optional<string[]>; // Array of ObjectIDs for update
    folder_path?: Optional<string>;
    environment?: StringStringRecord;
}

// --- Stack ---
export interface StackInput {
    _id?: Optional<string>; // MongoDB ObjectID
    name: string;
    services?: Optional<{ id: string; collection: string }[]>; // Array of references
    created_at?: Optional<string>;
}

export interface StackOutput {
    _id?: Optional<string>; // MongoDB ObjectID
    name: string;
    services?: Optional<{ id: string; collection: string }[]>; // Array of references
    created_at?: Optional<string>;
}

export interface StackUpdate {
    name?: Optional<string>;
    services?: Optional<string[]>; // Array of ObjectIDs for update
}

// --- Service ---
export interface ServiceInput {
    _id?: Optional<string>; // MongoDB ObjectID
    docker_config: DockerServiceConfigInput;
    to_generate_environment?: StringStringRecord;
    required_environment?: Optional<string[]>;
    created_at?: Optional<string>;
}

export interface ServiceOutput {
    _id?: Optional<string>; // MongoDB ObjectID
    docker_config: DockerServiceConfigOutput;
    to_generate_environment?: StringStringRecord;
    required_environment?: Optional<string[]>;
    created_at?: Optional<string>;
}

export interface ServiceUpdate {
    docker_config?: Optional<DockerServiceConfigUpdate>;
    to_generate_environment?: StringStringRecord;
    required_environment?: Optional<string[]>;
}

// --- Validation Error ---
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface HTTPValidationError {
    detail?: ValidationError[];
}


// ===========================================================================
// CLIENTE DA API (Funções para interagir com o Backend)
// ===========================================================================

/**
 * Função utilitária para fazer requisições à API.
 * @param endpoint O caminho da API (ex: '/api/clients').
 * @param method O método HTTP (GET, POST, PUT, PATCH, DELETE).
 * @param data O corpo da requisição (para POST, PUT, PATCH).
 * @param token O token JWT para autenticação.
 * @returns A resposta da API.
 */
async function apiRequest<T>(
    endpoint: string,
    method: string,
    data?: any,
    token?: string
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData: HTTPValidationError = await response.json();
        const errorMessage = errorData.detail?.map(err => `${err.loc.join('.')} - ${err.msg}`).join(', ') || response.statusText;
        throw new Error(`API Error: ${response.status} - ${errorMessage}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {} as T; // Return an empty object for no content
    }

    return response.json();
}

// Exemplo de uso do token (você deve obter isso do seu sistema de autenticação)
// const authToken = 'SEU_TOKEN_JWT_AQUI';

// --- API de Serviços ---
export const ServicesApi = {
    /**
     * Lista todos os serviços.
     * @param token O token JWT.
     */
    listServices: (token: string): Promise<ServiceOutput[]> => {
        return apiRequest<ServiceOutput[]>('/api/services/', 'GET', undefined, token);
    },

    /**
     * Cria um novo serviço.
     * @param service O objeto ServiceInput.
     * @param token O token JWT.
     */
    createService: (service: ServiceInput, token: string): Promise<ServiceOutput> => {
        return apiRequest<ServiceOutput>('/api/services/', 'POST', service, token);
    },

    /**
     * Obtém um serviço pelo ID.
     * @param serviceId O ID do serviço.
     * @param token O token JWT.
     */
    getService: (serviceId: string, token: string): Promise<ServiceOutput> => {
        return apiRequest<ServiceOutput>(`/api/services/${serviceId}`, 'GET', undefined, token);
    },

    /**
     * Atualiza um serviço existente.
     * @param serviceId O ID do serviço.
     * @param serviceUpdate Os dados de atualização do serviço.
     * @param token O token JWT.
     */
    updateService: (serviceId: string, serviceUpdate: ServiceUpdate, token: string): Promise<ServiceOutput> => {
        return apiRequest<ServiceOutput>(`/api/services/${serviceId}`, 'PATCH', serviceUpdate, token);
    },

    /**
     * Deleta um serviço.
     * @param serviceId O ID do serviço.
     * @param token O token JWT.
     */
    deleteService: (serviceId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/services/${serviceId}`, 'DELETE', undefined, token);
    },
};

// --- API de Stacks ---
export const StacksApi = {
    /**
     * Lista todas as stacks.
     * @param token O token JWT.
     */
    listStacks: (token: string): Promise<StackOutput[]> => {
        return apiRequest<StackOutput[]>('/api/stacks/', 'GET', undefined, token);
    },

    /**
     * Cria uma nova stack.
     * @param stack O objeto StackInput.
     * @param token O token JWT.
     */
    createStack: (stack: StackInput, token: string): Promise<StackOutput> => {
        return apiRequest<StackOutput>('/api/stacks/', 'POST', stack, token);
    },

    /**
     * Obtém uma stack pelo ID.
     * @param stackId O ID da stack.
     * @param token O token JWT.
     */
    getStack: (stackId: string, token: string): Promise<StackOutput> => {
        return apiRequest<StackOutput>(`/api/stacks/${stackId}`, 'GET', undefined, token);
    },

    /**
     * Atualiza uma stack existente.
     * @param stackId O ID da stack.
     * @param stackUpdate Os dados de atualização da stack.
     * @param token O token JWT.
     */
    updateStack: (stackId: string, stackUpdate: StackUpdate, token: string): Promise<StackOutput> => {
        return apiRequest<StackOutput>(`/api/stacks/${stackId}`, 'PATCH', stackUpdate, token);
    },

    /**
     * Deleta uma stack.
     * @param stackId O ID da stack.
     * @param token O token JWT.
     */
    deleteStack: (stackId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/stacks/${stackId}`, 'DELETE', undefined, token);
    },
};

// --- API de Clientes ---
export const ClientsApi = {
    /**
     * Lista todos os clientes.
     * @param token O token JWT.
     */
    listClients: (token: string): Promise<ClientOutput[]> => {
        return apiRequest<ClientOutput[]>('/api/clients/', 'GET', undefined, token);
    },

    /**
     * Cria um novo cliente.
     * @param client O objeto ClientInput.
     * @param token O token JWT.
     */
    createClient: (client: ClientInput, token: string): Promise<ClientOutput> => {
        return apiRequest<ClientOutput>('/api/clients/', 'POST', client, token);
    },

    /**
     * Obtém um cliente pelo ID.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    getClient: (clientId: string, token: string): Promise<ClientOutput> => {
        return apiRequest<ClientOutput>(`/api/clients/${clientId}`, 'GET', undefined, token);
    },

    /**
     * Atualiza um cliente existente.
     * @param clientId O ID do cliente.
     * @param clientUpdate Os dados de atualização do cliente.
     * @param token O token JWT.
     */
    updateClient: (clientId: string, clientUpdate: ClientUpdate, token: string): Promise<ClientOutput> => {
        return apiRequest<ClientOutput>(`/api/clients/${clientId}`, 'PATCH', clientUpdate, token);
    },

    /**
     * Deleta um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    deleteClient: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/clients/${clientId}`, 'DELETE', undefined, token);
    },
};

// --- API de Compose ---
export const ComposeApi = {
    /**
     * Executa 'docker-compose up' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeUp: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/up/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Executa 'docker-compose down' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeDown: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/down/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Obtém o status do compose para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeStatus: (clientId: string, token: string): Promise<any> => { // OpenAPI schema is empty, so using any
        return apiRequest<any>(`/api/compose/compose/status/${clientId}`, 'GET', undefined, token);
    },

    /**
     * Executa 'docker-compose start' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeStart: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/start/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Executa 'docker-compose stop' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeStop: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/stop/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Executa 'docker-compose restart' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeRestart: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/restart/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Obtém os logs do compose para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeLogs: (clientId: string, token: string): Promise<any> => { // OpenAPI schema is empty, so using any
        return apiRequest<any>(`/api/compose/compose/logs/${clientId}`, 'GET', undefined, token);
    },

    /**
     * Executa 'docker-compose ps' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composePs: (clientId: string, token: string): Promise<any> => { // OpenAPI schema is empty, so using any
        return apiRequest<any>(`/api/compose/compose/ps/${clientId}`, 'GET', undefined, token);
    },

    /**
     * Executa 'docker-compose kill' para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    composeKill: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/kill/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Executa 'docker-compose scale' para um serviço de um cliente.
     * @param clientId O ID do cliente.
     * @param serviceName O nome do serviço.
     * @param replicas O número de réplicas.
     * @param token O token JWT.
     */
    composeScale: (clientId: string, serviceName: string, replicas: number, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/scale/${clientId}/${serviceName}/${replicas}`, 'POST', undefined, token);
    },

    /**
     * Executa um comando dentro de um serviço de um cliente.
     * @param clientId O ID do cliente.
     * @param serviceName O nome do serviço.
     * @param command O comando a ser executado.
     * @param token O token JWT.
     */
    composeExec: (clientId: string, serviceName: string, command: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/compose/compose/exec/${clientId}/${serviceName}/${command}`, 'POST', undefined, token);
    },
};

// --- API de Deploy ---
export const DeployApi = {
    /**
     * Executa o deploy para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    deployClient: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/deploy/deploy/${clientId}`, 'POST', undefined, token);
    },

    /**
     * Checa a integridade do deploy para um cliente.
     * @param clientId O ID do cliente.
     * @param token O token JWT.
     */
    checkDeploymentIntegrity: (clientId: string, token: string): Promise<void> => {
        return apiRequest<void>(`/api/deploy/deploy/${clientId}/integrity`, 'POST', undefined, token);
    },
};

// ===========================================================================
// EXPORTAÇÕES CONSOLIDADAS
// ===========================================================================

export const Api = {
    Services: ServicesApi,
    Stacks: StacksApi,
    Clients: ClientsApi,
    Compose: ComposeApi,
    Deploy: DeployApi,
};
