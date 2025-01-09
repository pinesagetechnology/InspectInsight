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
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();
    const selectedStructure = useSelector(getCurrentStructure);
    
    const handleGetDirections = () => {
        if (selectedStructure) {
            // Open Google Maps directions
            const { latitude, longitude } = selectedStructure.location;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        }
    };

    const handleViewPreviousInspection = () => {
        dispatch({
            type: actions.REVIEW_PREVIOUS_INSPECTION_DATA
        } as PayloadAction);
        
        goTo(RoutesValueEnum.PreviousInspection);
    }

    const columns: GridColDef<(typeof structures)[number]>[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
            editable: true,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 150,
            editable: true,
        },
        {
            field: 'code',
            headerName: 'Code',
            width: 150,
            editable: true,
        },
        {
            field: 'overal',
            headerName: 'Overal',
            width: 150,
            editable: true,
        },
        {
            field: 'lastInspectionDate',
            headerName: 'Last Inspection Date',
            width: 180,
            valueGetter: (value, row) => new Date(row.lastInspectionDate).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 450,
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Stack direction={'row'} spacing={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={onStartClickHandler}>
                                Inspection
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<HistoryIcon />}
                            onClick={() => handleViewPreviousInspection()}>
                                History
                        </Button>
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<DirectionsIcon />}
                            onClick={handleGetDirections}
                        >
                            Direction
                        </Button>
                    </Stack>
                );
            },
        },
    ];

    const toggleView = () => setIsListView(!isListView);

    const onRowSelectionhandler = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        onSelectStructure(structures.find(x => x.id === params.id) || {} as Structure);
    }

    return (
        <div>
            <Button variant="contained" onClick={toggleView} style={{ marginBottom: '16px' }}>
                Show Map
            </Button>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={structures}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    rowSelection={true}
                    onRowClick={onRowSelectionhandler}
                    getRowId={(row) => row.id}
                />
            </Box>
        </div>
    );
};

export default ListModeStructure;
