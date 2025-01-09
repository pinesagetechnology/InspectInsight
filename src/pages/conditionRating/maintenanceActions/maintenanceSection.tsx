import React, { useEffect, useState } from 'react'
import {
    Container,
    Switch,
    TextField,
    Button,
    Grid2 as Grid,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AccordionActions
} from '@mui/material';
import { MaintenanceActionModel, MaintenanceImageFile } from '../../../models/inspectionModel';
import { useDispatch, useSelector } from 'react-redux';
import SelectComponent from '../../../components/selectComponent';
import DatePickerComponent from '../../../components/dataPickerComponent';
import styles from "./style.module.scss";
import {
    ProbabilityItem,
    ConsequenceOfInteractionItem,
    ActivityInactionRiskItem
} from '../../../constants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../../store/MaintenanceAction/actions";
import ImageUpload from '../../../components/imageUploadComponent';
import { getIsUploadingFlag, getMaintenanceFormData } from '../../../store/MaintenanceAction/selectors';

interface MaintenanceSectionProps {
    maintenanceActionData: MaintenanceActionModel;
}

const MaintenanceSection: React.FunctionComponent<MaintenanceSectionProps> = ({
    maintenanceActionData,
}) => {
    const dispatch = useDispatch();
    const currentMaintenanceFormData = useSelector(getMaintenanceFormData);
    const uploadFlag = useSelector(getIsUploadingFlag);

    const [formData, setFormData] = useState<MaintenanceActionModel>({} as MaintenanceActionModel);

    useEffect(() => {
        if (maintenanceActionData.mode === 0) {
            setFormData(maintenanceActionData);
        } else {
            setFormData(currentMaintenanceFormData);
        }

    }, [maintenanceActionData, currentMaintenanceFormData])

    const handleSave = () => {
        if (formData.id === "-1") {
            dispatch({
                payload: formData,
                type: actions.ADD_MAINTENANCE_ACTION_DATA
            } as PayloadAction<MaintenanceActionModel>)
        } else {
            dispatch({
                payload: formData,
                type: actions.UPDATE_MAINTENANCE_ACTION_DATA
            } as PayloadAction<MaintenanceActionModel>)
        }

    };

    const handleCancel = () => {
        dispatch({
            type: actions.CANCEL_NEW_ITEM
        } as PayloadAction)
    }

    const handleDelete = () => {
        dispatch({
            type: actions.DELETE_MAINTENANCE_ACTION_DATA,
            payload: formData.id
        } as PayloadAction<string>)
    };

    const handleEdit = () => {
        dispatch({
            type: actions.EDIT_ITEM,
            payload: formData.id
        } as PayloadAction<string>)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        dispatch({
            type: actions.SET_MAINTENANCE_FORM_DATA,
            payload: { ...formData, [name as string]: value }
        } as PayloadAction<MaintenanceActionModel>);
    };

    const handleToggleComplete = () => {
        dispatch({
            type: actions.SET_MAINTENANCE_FORM_DATA,
            payload: { ...formData, isComplete: !formData.isComplete }
        } as PayloadAction<MaintenanceActionModel>);
    };

    const onSelectTypeChange = (name: string, value: string) => {
        dispatch({
            type: actions.SET_MAINTENANCE_FORM_DATA,
            payload: { ...formData, [name as string]: value }
        } as PayloadAction<MaintenanceActionModel>);
    }

    const onDateChangeHandler = (name: string, newDate: string) => {
        dispatch({
            type: actions.SET_MAINTENANCE_FORM_DATA,
            payload: { ...formData, [name as string]: newDate }
        } as PayloadAction<MaintenanceActionModel>);
    }

    const handleImageUpload = (photos: MaintenanceImageFile[]) => {
        dispatch({
            type: actions.UPLOAD_MAINTENANCE_IMAGE,
            payload: { ...formData, photos: [...photos] }
        } as PayloadAction<MaintenanceActionModel>);
    }

    const handleAccordionOnChange = (id: string) => {
        if (maintenanceActionData.mode === 0) {
            dispatch({
                type: actions.SET_SELECTED_MAINTENANCE_ITEM,
                payload: id
            } as PayloadAction<string>)
        }
    }

    return (
        <Accordion
            onChange={() => handleAccordionOnChange(maintenanceActionData?.id)}
            expanded={maintenanceActionData.isSectionExpanded ? true : false}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="maintenanceActionHeader"
                id="maintenanceActionHeader"
            >
                <Container fixed>
                    <Typography variant="h5" gutterBottom>
                        {
                            (maintenanceActionData.mode === 1) ?
                                "Adding new maintenance action"
                                :
                                formData.activityDescription
                        }
                    </Typography>
                </Container>
            </AccordionSummary>
            <AccordionDetails>
                <Container fixed>
                    <Box mt={4}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <Box display="flex" alignItems="center">
                                    <Switch checked={formData.isComplete || false}
                                        onChange={handleToggleComplete}
                                        disabled={maintenanceActionData.mode === 0}
                                    />
                                    <Typography>Mark as Complete</Typography>
                                </Box>
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="Elemnt Code"
                                    name="elemntCode"
                                    value={maintenanceActionData.elementCode}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={true}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    label="MMS Act. No."
                                    name="mmsActNo"
                                    value={formData.mmsActNo || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Activity Description"
                                    name="activityDescription"
                                    value={formData.activityDescription || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>


                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Inspection Comments"
                                    name="inspectionComment"
                                    value={formData.inspectionComment || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Units"
                                    name="units"
                                    value={formData.units || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={6}>
                                <DatePickerComponent
                                    name="dateForCompletion"
                                    label='Date of completion'
                                    isoDateValue={formData.dateForCompletion}
                                    onDateChange={onDateChangeHandler}
                                    controlStyle={styles.datePicker}
                                    disabled={maintenanceActionData.mode === 0}

                                />
                            </Grid>
                            <Grid size={4}>
                                <SelectComponent
                                    label='Probability'
                                    name='probability'
                                    selectedValue={formData.probability || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ProbabilityItem}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={4}>
                                <SelectComponent
                                    label='Consequence of interaction'
                                    name='consequenceOfInteraction'
                                    selectedValue={formData.consequenceOfInteraction || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ConsequenceOfInteractionItem}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={4}>
                                <SelectComponent
                                    label='Activity inaction risk'
                                    name='activityInactionRisk'
                                    selectedValue={formData.activityInactionRisk || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ActivityInactionRiskItem}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>
                            {
                                (maintenanceActionData.mode > 0) &&
                                <Grid size={12}>
                                    <ImageUpload handleImageUpload={handleImageUpload} images={formData.photos || []} />
                                </Grid>
                            }
                        </Grid>
                    </Box>
                </Container>
            </AccordionDetails>
            <AccordionActions>
                {
                    (maintenanceActionData.mode !== 0) ?
                        (
                            <React.Fragment>
                                <Button onClick={handleSave} disabled={uploadFlag}>Save</Button>
                                <Button onClick={handleCancel} disabled={uploadFlag}>Cancel</Button>
                            </React.Fragment>
                        )
                        :
                        (
                            <React.Fragment>
                                <Button onClick={handleDelete}>Delete</Button>
                                <Button onClick={handleEdit}>Edit</Button>
                            </React.Fragment>
                        )
                }


            </AccordionActions>
        </Accordion>
    )
}

export default MaintenanceSection;