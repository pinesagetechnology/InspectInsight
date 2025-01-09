import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuItemModel } from '../../models/menuItemModel';

interface SelectComponentProps {
    name: string;
    selectStyle?: string;
    label: string;
    menuItemList: MenuItemModel[];
    selectedValue: string;
    disabled?: boolean;
    setSelectedValueHandler: (name: string, value: string) => void;
    error?: boolean;
}

const SelectComponent: React.FunctionComponent<SelectComponentProps> = ({
    name,
    selectStyle,
    label,
    menuItemList,
    selectedValue,
    disabled,
    error,
    setSelectedValueHandler
}) => {

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedValueHandler(name, event.target.value);
    };

    return (
        <div className={selectStyle}>
            <FormControl fullWidth>
                <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
                <Select
                    error={error}
                    labelId={`${name}-select-label`}
                    id={`${name}-select-Id`}
                    value={selectedValue}
                    label={label}
                    onChange={handleChange}
                    disabled={disabled}
                >
                    <MenuItem value="">Select type</MenuItem>
                    {menuItemList?.map((item, index) => {
                        return <MenuItem key={`${item.value}-${index}`} value={item.value}>{item.text}</MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
    );
}

export default SelectComponent;