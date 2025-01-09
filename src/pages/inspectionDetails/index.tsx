import React, { ChangeEvent, useEffect, useState } from 'react';
import {
    Container,
    TextField,
    Typography,
    Box,
    Grid2 as Grid
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getFormValidationErrors, getInspection } from '../../store/Inspection/selectors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { InspectionFomrValidationPayload, InspectionModel } from '../../models/inspectionModel';
import * as actions from "../../store/Inspection/actions";
import SelectComponent from '../../components/selectComponent';
import { inspectionLevelItem, inspectionTypeItem, weatherTypeItem } from '../../constants';
import DatePickerComponent from '../../components/dataPickerComponent';
import styles from "./style.module.scss";

const InspectionDetailForm: React.FC = () => {
    const inspectionDetail = useSelector(getInspection);
    const validationList = useSelector(getFormValidationErrors);
    const dispatch = useDispatch();

    const formValidation = (name: string, value: string) => {
        dispatch({
            type: actions.SET_INSPECTION_VALIDATION_FLAG,
            payload: {
                name, value
            }
        } as PayloadAction<InspectionFomrValidationPayload>)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        formValidation(name, value);

        dispatch({
            payload: {
                ...inspectionDetail,
                [name]: value,
            },
            type: actions.SET_INSPECTION_DATA
        } as PayloadAction<InspectionModel>);
    };

    const handleChangeTemprature = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        formValidation(name, value);

        if (value === "") {
            dispatch({
                payload: {
                    ...inspectionDetail,
                    [name]: value
                },
                type: actions.SET_INSPECTION_DATA
            } as PayloadAction<InspectionModel>);
            return;
        }

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= -100 && numValue <= 100) {
            dispatch({
                payload: { ...inspectionDetail, temperature: numValue },
                type: actions.SET_INSPECTION_DATA
            } as PayloadAction<InspectionModel>);
        }
    };

    const onSelectTypeChange = (name: string, value: string) => {
        formValidation(name, value);

        dispatch({
            payload: {
                ...inspectionDetail,
                [name]: value,
            },
            type: actions.SET_INSPECTION_DATA
        } as PayloadAction<InspectionModel>);
    }

    const onDateChangeHandler = (name: string, newDate: string) => {
        dispatch({
            payload: {
                ...inspectionDetail,
                [name]: newDate,
            },
            type: actions.SET_INSPECTION_DATA
        } as PayloadAction<InspectionModel>);
    }

    return (
        <FormPageWrapper>
            <Container maxWidth="md">
                <Box mt={5}>
                    <Typography variant="h5" gutterBottom>
                        Inspection Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={6}>
                            <SelectComponent
                                label='Inspection Level'
                                name='inspectionLevel'
                                selectedValue={inspectionDetail.inspectionLevel || ""}
                                setSelectedValueHandler={onSelectTypeChange}
                                menuItemList={inspectionLevelItem}
                                error={validationList.some(x => x === 'inspectionLevel')}
                            />
                        </Grid>
                        <Grid size={6}>
                            <DatePickerComponent
                                name="inspectionDate"
                                label='Inspection Date'
                                isoDateValue={inspectionDetail.inspectionDate}
                                onDateChange={onDateChangeHandler}
                                controlStyle={styles.datePicker}
                            />
                        </Grid>
                        <Grid size={6}>
                            <SelectComponent
                                label='Inspection Type'
                                name='inspectionType'
                                selectedValue={inspectionDetail.inspectionType || ""}
                                setSelectedValueHandler={onSelectTypeChange}
                                menuItemList={inspectionTypeItem}
                                error={validationList.some(x => x === 'inspectionType')}
                            />
                        </Grid>
                        <Grid size={6}>
                            <DatePickerComponent
                                name="nextInspectionProposedDate"
                                label="Next Inspection Proposed Date"
                                isoDateValue={inspectionDetail.nextInspectionProposedDate}
                                onDateChange={onDateChangeHandler}
                                controlStyle={styles.datePicker}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Temperature (degrees)"
                                name="temperature"
                                type="number"
                                value={inspectionDetail.temperature || ""}
                                onChange={handleChangeTemprature}
                                variant="outlined"
                                slotProps={{ htmlInput: { min: "-100", max: "100", step: "0.1" } }}
                                error={validationList.some(x => x === 'temperature')}
                            />
                        </Grid>
                        <Grid size={6}>
                            <SelectComponent
                                label='Weather'
                                name='weather'
                                selectedValue={inspectionDetail.weather || ""}
                                setSelectedValueHandler={onSelectTypeChange}
                                menuItemList={weatherTypeItem}
                                error={validationList.some(x => x === 'weather')}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Inspector Name"
                                name="inspectorName"
                                value={inspectionDetail.inspectorName || ""}
                                onChange={handleChange}
                                variant="outlined"
                                error={validationList.some(x => x === 'inspectorName')}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Engineer Name"
                                name="engineerName"
                                value={inspectionDetail.engineerName || ""}
                                onChange={handleChange}
                                variant="outlined"
                                error={validationList.some(x => x === 'engineerName')}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box className={styles.inspectionFormFooter}>
                    <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                        *Please fill in all the inspection fields
                    </Typography>
                </Box>
            </Container>
        </FormPageWrapper>
    );
};

export default InspectionDetailForm;
