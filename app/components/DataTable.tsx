import React, { type ReactNode } from 'react';

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

export const DataTable = <T extends { _id?: string | number }>({ headers, data, onRowClick, renderCell, renderActions, pagination, loading, error }: DataTableProps<T>) => {
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
