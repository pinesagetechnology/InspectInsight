import React, { useCallback } from 'react';
import {
    Button,
    Grid2 as Grid,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AccordionActions,
    styled
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Structure } from '../../entities/structure';
import { ChevronRight, Navigation, History, DirectionsOutlined } from '@mui/icons-material';
import { useNavigationManager } from '../../navigation';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { RoutesValueEnum } from '../../enums';
import { useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import { defaultDateValue } from '../../constants';
import { FormatDateOnly } from '../../helper/util';

const DetailLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.5)
}));

const DetailValue = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 500
}));

const ActionButton = styled(Button)(({ theme, variant }) => ({
    width: '100%',
    padding: theme.spacing(1.5),
    backgroundColor: variant === 'contained' ? '#000' : '#F3F4F6',
    color: variant === 'contained' ? '#fff' : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: variant === 'contained' ? '#333' : '#E5E7EB',
    },
    textTransform: 'none',
    borderRadius: theme.shape.borderRadius
}));

interface RowComponentProps {
    structure: Structure;
    onSelectStructure: (structure: Structure) => void;
    onStartClickHandler: () => void;
}

const RowComponent: React.FC<RowComponentProps> = ({
    structure,
    onSelectStructure,
    onStartClickHandler,
}) => {
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();
    const selectedStructure = useSelector(getCurrentStructure);

    const onRowSelectionhandler = useCallback(() => {
        onSelectStructure(structure);
    }, [structure, onSelectStructure]);

    const handleViewPreviousInspections = () => {
        dispatch({
            type: actions.GET_LIST_INSPECTIONS_DATA
        } as PayloadAction);

        goTo(RoutesValueEnum.PreviousInspection);
    }

    const handleGetDirections = () => {
        if (selectedStructure) {
            // Open Google Maps directions
            const { latitude, longitude } = selectedStructure.location;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        }
    }

    return (
        <Accordion
            onChange={() => onRowSelectionhandler()}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="structureItemRow"
                id="structureItemRowDetail"
            >
                <Grid container spacing={1} sx={{ width: '100%' }}>
                    <Grid size={4}>
                        <DetailLabel>Code</DetailLabel>
                        <DetailValue>{structure.code}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Structure Name</DetailLabel>
                        <DetailValue>{structure.name}</DetailValue>
                    </Grid>

                    <Grid size={4}>
                        <DetailLabel>Over</DetailLabel>
                        <DetailValue>{structure.over}</DetailValue>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={3} mb={3}>
                    <Grid size={4}>
                        <DetailLabel>Next Inspection Date</DetailLabel>
                        <DetailValue>{(selectedStructure.previousInspection?.nextInspectionProposedDate === defaultDateValue) ? "" : FormatDateOnly(selectedStructure.previousInspection?.nextInspectionProposedDate || "")}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Type</DetailLabel>
                        <DetailValue>{selectedStructure.type}</DetailValue>
                    </Grid>

                    <Grid size={4}>
                        <DetailLabel>Last Inspection Date</DetailLabel>
                        <DetailValue>{FormatDateOnly(selectedStructure.lastInspectionDate)}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Overall Length</DetailLabel>
                        <DetailValue>{selectedStructure.overalLength}</DetailValue>
                    </Grid>

                    <Grid size={4}>
                        <DetailLabel>Overall min deck width</DetailLabel>
                        <DetailValue>{selectedStructure.overalWidth}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Max carriageway width</DetailLabel>
                        <DetailValue>{selectedStructure.maxCmy}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Min carriageway width</DetailLabel>
                        <DetailValue>{selectedStructure.maxMd}</DetailValue>
                    </Grid>

                    <Grid size={4}>
                        <DetailLabel>LGA</DetailLabel>
                        <DetailValue>{selectedStructure.LGA}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Min vert clear bridge</DetailLabel>
                        <DetailValue>{selectedStructure.minVert}</DetailValue>
                    </Grid>
                </Grid>
            </AccordionDetails>
            <AccordionActions>
                {/* Action Buttons */}
                <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid size={4}>
                        <ActionButton
                            variant="contained"
                            startIcon={<Navigation />}
                            endIcon={<ChevronRight />}
                            onClick={onStartClickHandler}
                        >
                            Inspection
                        </ActionButton>
                    </Grid>
                    <Grid size={4}>
                        <ActionButton
                            variant="outlined"
                            startIcon={<History />}
                            endIcon={<ChevronRight />}
                            onClick={() => handleViewPreviousInspections()}
                        >
                            Previous
                        </ActionButton>
                    </Grid>
                    <Grid size={4}>
                        <ActionButton
                            variant="outlined"
                            startIcon={<DirectionsOutlined />}
                            endIcon={<ChevronRight />}
                            onClick={handleGetDirections}
                        >
                            Directions
                        </ActionButton>
                    </Grid>
                </Grid>
            </AccordionActions>
        </Accordion>
    );
};

export default RowComponent;