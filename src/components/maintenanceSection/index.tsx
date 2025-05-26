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
    AccordionActions,
    useMediaQuery,
    FormHelperText,
} from '@mui/material';
import { MaintenanceActionModel } from '../../models/inspectionModel';
import { useDispatch, useSelector } from 'react-redux';
import SelectComponent from '../selectComponent';
import DatePickerComponent from '../dataPickerComponent';
import styles from "./style.module.scss";
import {
    ProbabilityItem,
    ConsequenceOfInteractionItem,
    ActivityInactionRiskItem
} from '../../constants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/MaintenanceAction/actions";
import ImageUpload from '../imageUploadComponent';
import { getIsUploadingFlag, getMaintenanceFormData, getMaintenanceValidationErrors } from '../../store/MaintenanceAction/selectors';
import { getElementsCodeListData, getMMSActivities, getMMSActivityData } from "../../store/SystemData/selectors";

interface MaintenanceSectionProps {
    maintenanceActionData: MaintenanceActionModel;
}

const getValidationMessage = (fieldName: string): string => {
    switch (fieldName) {
        case 'inspectionComment':
            return 'Please enter inspection comments';
        case 'units':
            return 'Please enter units';
        case 'probability':
            return 'Please select probability';
        case 'consequenceOfInteraction':
            return 'Please select consequence of interaction';
        case 'activityInactionRisk':
            return 'Please select activity inaction risk';
        default:
            return 'This field is required';
    }
};

const MaintenanceSection: React.FunctionComponent<MaintenanceSectionProps> = ({
    maintenanceActionData,
}) => {
    const dispatch = useDispatch();
    const mmsActivityData = useSelector(getMMSActivityData);
    const mmsMnueItems = useSelector(getMMSActivities);
    const isPortrait = useMediaQuery('(max-width:600px)');
    const currentMaintenanceFormData = useSelector(getMaintenanceFormData);
    const uploadFlag = useSelector(getIsUploadingFlag);
    const validationErrors: string[] = useSelector(getMaintenanceValidationErrors);

    const [formData, setFormData] = useState<MaintenanceActionModel>({} as MaintenanceActionModel);

    useEffect(() => {
        if (maintenanceActionData.mode === 0) {
            setFormData(maintenanceActionData);
        } else {
            setFormData(currentMaintenanceFormData);
        }
    }, [maintenanceActionData, currentMaintenanceFormData])

    const handleSave = () => {
        dispatch({
            type: actions.SET_MAINTENANCE_VALIDATION,
            payload: formData
        } as PayloadAction<MaintenanceActionModel>);

        if (validationErrors.length === 0) {
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

    const handleAccordionOnChange = (id: string) => {
        if (maintenanceActionData.mode === 0) {
            dispatch({
                type: actions.SET_SELECTED_MAINTENANCE_ITEM,
                payload: id
            } as PayloadAction<string>)
        }
    }

    const handleMMSActivityChangeChange = (name: string, value: string) => {
        const activityItem = mmsActivityData.find(item => item.code === value);

        dispatch({
            type: actions.SET_MAINTENANCE_FORM_DATA,
            payload: {
                ...formData,
                ["mmsActNo"]: value,
                ["activityDescription"]: activityItem?.description
            }
        } as PayloadAction<MaintenanceActionModel>);
    };

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
                <Container
                    fixed
                    sx={{
                        px: isPortrait ? 1 : 2
                    }}>
                    <Typography
                        variant={isPortrait ? "h6" : "h5"}
                        gutterBottom
                    >
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
                <Container
                    fixed
                    sx={{
                        px: isPortrait ? 1 : 2
                    }}
                >
                    <Box mt={isPortrait ? 2 : 4}>
                        <Grid container spacing={isPortrait ? 2 : 3}>
                            <Grid size={12}>
                                <Box display="flex" alignItems="center">
                                    <Switch checked={formData.isComplete || false}
                                        onChange={handleToggleComplete}
                                        disabled={maintenanceActionData.mode === 0}
                                    />
                                    <Typography>Mark as Complete</Typography>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12 }}>
                                <SelectComponent
                                    label='MMS Act. No.'
                                    name='mmsActNo'
                                    selectedValue={formData.mmsActNo || ""}
                                    setSelectedValueHandler={handleMMSActivityChangeChange}
                                    menuItemList={mmsMnueItems}
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
                                    error={validationErrors.includes('inspectionComment')}
                                    helperText={validationErrors.includes('inspectionComment') ? getValidationMessage('inspectionComment') : ''}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Units"
                                    name="units"
                                    value={formData.units || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={maintenanceActionData.mode === 0}
                                    error={validationErrors.includes('units')}
                                    helperText={validationErrors.includes('units') ? getValidationMessage('units') : ''}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <DatePickerComponent
                                    name="dateForCompletion"
                                    label='Date of completion'
                                    isoDateValue={formData.dateForCompletion}
                                    onDateChange={onDateChangeHandler}
                                    controlStyle={styles.datePicker}
                                    disabled={maintenanceActionData.mode === 0}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <SelectComponent
                                    label='Probability'
                                    name='probability'
                                    selectedValue={formData.probability || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ProbabilityItem}
                                    disabled={maintenanceActionData.mode === 0}
                                    error={validationErrors.includes('probability')}
                                />
                                {validationErrors.includes('probability') && (
                                    <FormHelperText error>{getValidationMessage('probability')}</FormHelperText>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <SelectComponent
                                    label='Consequence of interaction'
                                    name='consequenceOfInteraction'
                                    selectedValue={formData.consequenceOfInteraction || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ConsequenceOfInteractionItem}
                                    disabled={maintenanceActionData.mode === 0}
                                    error={validationErrors.includes('consequenceOfInteraction')}
                                />
                                {validationErrors.includes('consequenceOfInteraction') && (
                                    <FormHelperText error>{getValidationMessage('consequenceOfInteraction')}</FormHelperText>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <SelectComponent
                                    label='Activity Inaction Risk'
                                    name='activityInactionRisk'
                                    selectedValue={formData.activityInactionRisk || ""}
                                    setSelectedValueHandler={onSelectTypeChange}
                                    menuItemList={ActivityInactionRiskItem}
                                    disabled={maintenanceActionData.mode === 0}
                                    error={validationErrors.includes('activityInactionRisk')}
                                />
                                {validationErrors.includes('activityInactionRisk') && (
                                    <FormHelperText error>{getValidationMessage('activityInactionRisk')}</FormHelperText>
                                )}
                            </Grid>

                            <Grid size={12}>
                                <ImageUpload formData={formData} />
                            </Grid>

                        </Grid>
                    </Box>
                </Container>
            </AccordionDetails>
            <AccordionActions
                sx={{
                    flexDirection: isPortrait ? 'column' : 'row',
                    '& > :not(style)': {
                        marginBottom: isPortrait ? 1 : 0,
                        width: isPortrait ? '100%' : 'auto'
                    },
                }}
            >
                {
                    (maintenanceActionData.mode !== 0) ?
                        (
                            <React.Fragment>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    disabled={uploadFlag}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleCancel}
                                    disabled={uploadFlag}
                                >
                                    Cancel
                                </Button>
                            </React.Fragment>
                        )
                        :
                        (
                            <React.Fragment>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEdit}
                                    disabled={uploadFlag}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleDelete}
                                    disabled={uploadFlag}
                                >
                                    Delete
                                </Button>
                            </React.Fragment>
                        )
                }
            </AccordionActions>
        </Accordion>
    )
}

export default MaintenanceSection;