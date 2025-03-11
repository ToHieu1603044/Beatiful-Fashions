// Filter.tsx
import React from "react";


type FilterProps = {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
};


const Filter: React.FC<FilterProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="mb-3">
            <label htmlFor={label} className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
            <select
                id={label}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Tất cả</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};


export default Filter;
