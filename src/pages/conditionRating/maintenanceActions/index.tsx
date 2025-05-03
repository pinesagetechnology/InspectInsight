import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MaintenanceSection from './maintenanceSection';
import { getElementMaintenanceAction } from '../../../store/MaintenanceAction/selectors';
import { Button, Container, Grid2 as Grid, Stack, useMediaQuery } from '@mui/material';
import * as actions from '../../../store/MaintenanceAction/actions';
import { PayloadAction } from '@reduxjs/toolkit';
import { getSelectedStructureElement } from '../../../store/ConditionRating/selectors';
import { StructureElement } from '../../../entities/structure';

const AssessmentFrom: React.FC = () => {
  const dispatch = useDispatch();
  const isPortrait = useMediaQuery('(max-width:600px)');
  const selectedElemment = useSelector(getSelectedStructureElement);
  const maintenanceActions = useSelector(getElementMaintenanceAction(selectedElemment.properties?.Tag?.value || selectedElemment.data.Entity));

  const handleAddNewAction = () => {
    dispatch({
      type: actions.ADD_NEW_ITEM,
      payload: selectedElemment
    } as PayloadAction<StructureElement>);
  }
  const isNewButtonDisabled = maintenanceActions?.some(x => x.id === "-1");

  return (
    <Grid container>
      <Grid size={12}>
        <Container
          fixed
          sx={{
            px: isPortrait ? 1 : 2
          }}
        >
          <Button
            variant='contained'
            onClick={handleAddNewAction}
            disabled={isNewButtonDisabled}
            fullWidth={isPortrait}
          >
            Add maintenance action
          </Button>
        </Container>
      </Grid>
      <Grid size={12}>
        <Stack
          direction={'column'}
          spacing={isPortrait ? 1 : 2}
          sx={{ mt: 2 }}
        >
          {maintenanceActions?.map((item, index) => {
            return <MaintenanceSection key={`${index}-${item.id}`} maintenanceActionData={item} />
          })}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AssessmentFrom;