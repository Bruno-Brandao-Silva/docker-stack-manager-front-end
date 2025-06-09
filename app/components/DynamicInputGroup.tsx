import React from 'react';

// Tipos para os itens do grupo de entrada dinâmico
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

interface DynamicInputGroupProps<T> {
    label: string;
    items: T[];
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onItemChange: (index: number, value: string, field?: keyof T) => void;
    placeholderKey?: string;
    placeholderValue?: string;
    isKeyValue?: boolean; // Verdadeiro para EnvVar, Args; falso para Ports, Volumes
}

export const DynamicInputGroup = <T extends EnvVar | PortMapping | VolumeMapping>({
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
