import React from 'react'
import {
    Card,
    CardContent,
    Typography,
    Grid2 as Grid,
    Divider,
    Stack,
    Button,
    Box,
    styled
} from '@mui/material';
import { Structure } from '../../entities/structure';
import { useNavigationManager } from '../../navigation';
import { useDispatch } from 'react-redux';
import { RoutesValueEnum } from '../../enums';
import * as actions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { ChevronRight, LocationOn, Navigation, History, DirectionsOutlined } from '@mui/icons-material';
import { defaultDateValue } from '../../constants';

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

interface StructureDetailSectionProps {
    selectedStructure: Structure;
    onStartClickHandler: () => void;
}

const StructureDetailSection: React.FunctionComponent<StructureDetailSectionProps> = ({
    selectedStructure,
    onStartClickHandler
}) => {
    const { goTo } = useNavigationManager();
    const dispatch = useDispatch();

    const handleGetDirections = () => {
        if (selectedStructure) {
            // Open Google Maps directions
            const { latitude, longitude } = selectedStructure.location;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        }
    };

    const handleViewPreviousInspections = () => {
        dispatch({
            type: actions.GET_LIST_INSPECTIONS_DATA
        } as PayloadAction);

        goTo(RoutesValueEnum.PreviousInspection);
    }

    return (
        <Card
            elevation={3}
            sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '70vh',
                overflow: 'auto'
            }}
        >
            {/* Header with location info */}
            <CardContent sx={{ pb: 1, margin: '0px 24px' }}>
                <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
                    <LocationOn color="action" />
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            {selectedStructure.name}
                        </Typography>
                        <Typography color="text.secondary" fontSize="0.875rem">
                            {`${selectedStructure.location.latitude}, ${selectedStructure.location.longitude}`}
                        </Typography>
                    </Box>
                </Stack>

                {/* Details Grid */}
                <Grid container spacing={3} mb={3}>
                    <Grid size={4}>
                        <DetailLabel>Next Inspection Date</DetailLabel>
                        <DetailValue>{(selectedStructure.previousInspection?.nextInspectionProposedDate === defaultDateValue) ? "" : ""}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Code</DetailLabel>
                        <DetailValue>{selectedStructure.code}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Type</DetailLabel>
                        <DetailValue>{selectedStructure.type}</DetailValue>
                    </Grid>

                    <Grid size={4}>
                        <DetailLabel>Last Inspection Date</DetailLabel>
                        <DetailValue>{selectedStructure.lastInspectionDate}</DetailValue>
                    </Grid>
                    <Grid size={4}>
                        <DetailLabel>Over</DetailLabel>
                        <DetailValue>{selectedStructure.over}</DetailValue>
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

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Grid container spacing={2}>
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
            </CardContent>
        </Card>
    )
}

export default StructureDetailSection;