import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { Structure } from '../../entities/structure';
import { DataGrid, GridCallbackDetails, GridColDef, GridRenderCellParams, GridRowParams, MuiEvent } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import DirectionsIcon from '@mui/icons-material/Directions';
import { useNavigationManager } from '../../navigation';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { RoutesValueEnum } from '../../enums';
import { useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import RowComponent from './rowComponent';

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
            <Button variant="contained" onClick={toggleView} style={{ marginBottom: '16px' }}>
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
