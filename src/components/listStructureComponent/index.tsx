import React, { useState } from 'react';
import { Box, Button, Checkbox, Divider, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { Structure } from '../../entities/structure';
import RowComponent from './rowComponent';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import { filtersByCategory } from '../../constants';

interface ListModeProps {
    isListView: boolean;
    structures: Structure[];
    onSelectStructure: (structure: Structure) => void;
    setIsListView: (isListView: boolean) => void;
    onStartClickHandler: () => void;
    applyFilter: (filters: Record<string, string[]>) => void;
}

const ListModeStructure: React.FC<ListModeProps> = ({
    isListView,
    structures,
    onSelectStructure,
    setIsListView,
    onStartClickHandler,
    applyFilter
}) => {
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleToggle = (category: string, item: string) => {
        setSelectedItems((prev) => {
            const current = prev[category] || [];
            return {
                ...prev,
                [category]: current.includes(item)
                    ? current.filter((i) => i !== item)
                    : [...current, item],
            };
        });
    };

    const onApplyFilterClick = () => {
        applyFilter(selectedItems);
        handleMenuClose();
    };

    const clearFilters = () => {
        setSelectedItems({});
        applyFilter({});
        handleMenuClose();
    };

    const toggleView = () => setIsListView(!isListView);


    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button variant="outlined" startIcon={<MapIcon />} onClick={toggleView}>
                    Show Map
                </Button>

                <Button variant="outlined" startIcon={<TuneIcon />} onClick={handleMenuOpen}>
                    Filter
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    {filtersByCategory.map((group, index) => (
                        <div key={group.category}>
                            {index > 0 && <Divider />}
                            <Typography sx={{ px: 2, pt: 1, fontWeight: 'bold' }} variant="body2">
                                {group.category}
                            </Typography>
                            {group.items.map((item) => (
                                <MenuItem key={item} onClick={() => handleToggle(group.category, item)}>
                                    <Checkbox checked={selectedItems[group.category]?.includes(item) || false} />
                                    <ListItemText primary={item} />
                                </MenuItem>
                            ))}
                        </div>
                    ))}
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={clearFilters} color="secondary" fullWidth>
                            Clear
                        </Button>
                        <Button variant="contained" onClick={onApplyFilterClick} fullWidth>
                            Apply
                        </Button>
                    </Box>
                </Menu>
            </Box>

            <Box sx={{ height: 400, width: '100%' }}>
                {structures.length > 0 && (
                    structures.map((structure) => (
                        <RowComponent
                            key={structure.id}
                            structure={structure}
                            onSelectStructure={onSelectStructure}
                            onStartClickHandler={onStartClickHandler}
                        />
                    ))
                )}
            </Box>
        </div>
    );
};

export default ListModeStructure;
