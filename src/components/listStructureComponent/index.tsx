import React from 'react';
import { Box, Button } from '@mui/material';
import { Structure } from '../../entities/structure';
import RowComponent from './rowComponent';
import MapIcon from '@mui/icons-material/Map';

interface ListModeProps {
    isListView: boolean;
    structures: Structure[];
    onSelectStructure: (structure: Structure) => void;
    setIsListView: (isListView: boolean) => void;
    onStartClickHandler: () => void;
}

const ListModeStructure: React.FC<ListModeProps> = ({
    isListView,
    structures,
    onSelectStructure,
    setIsListView,
    onStartClickHandler
}) => {
    const toggleView = () => setIsListView(!isListView);

    return (
        <div>
            {/* <Button variant="contained" onClick={toggleView} style={{ marginBottom: '16px' }}> */}
            <Button variant="outlined" startIcon={<MapIcon />} onClick={toggleView}>
                Show Map
            </Button>
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
