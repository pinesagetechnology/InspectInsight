import React from 'react'
import {
    Card,
    CardContent,
    Container,
    Typography,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Stack,
    Button
} from '@mui/material';
import { Structure } from '../../entities/structure';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import DirectionsIcon from '@mui/icons-material/Directions';
import { useNavigationManager } from '../../navigation';
import { useDispatch } from 'react-redux';
import { RoutesValueEnum } from '../../enums';
import * as actions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';

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

    const handleViewPreviousInspection = () => {
        dispatch({
            type: actions.REVIEW_PREVIOUS_INSPECTION_DATA
        } as PayloadAction);
        
        goTo(RoutesValueEnum.PreviousInspection);
    }

    return (
        <Container maxWidth="lg" sx={{marginTop:'10px'}} >
            <Card raised>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        Structure Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <List>
                                <ListItem>
                                    <ListItemText primary="Name" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.name}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Code" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.code}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Type" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.type}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Overall Condition" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.overal}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Location" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.at}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid size={6}>
                            <List>
                                <ListItem>
                                    <ListItemText primary="Overall Length" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.overalLength}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Overall Width" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.overalWidth}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Maximum Capacity (cmy)" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.maxCmy}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Maximum Load (Md)" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {selectedStructure.maxMd}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemText primary="Last Inspection Date" />
                                    <ListItemText
                                        secondary={
                                            <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
                                                {new Date(selectedStructure.lastInspectionDate).toLocaleDateString()}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
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
                            Previous Inspection
                        </Button>
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<DirectionsIcon />}
                            onClick={handleGetDirections}
                        >
                            Directions
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    )
}

export default StructureDetailSection;