import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import styles from "./style.module.scss";
import { getInspection } from '../../store/Inspection/selectors';
import { getMaintenanceAction } from '../../store/MaintenanceAction/selectors';
import { getInspectionComment } from '../../store/InspectionComment/selectors';
import { getRatedElements } from '../../store/ConditionRating/selectors';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as stepActions from "../../store/FormSteps/actions";
import * as reviewActions from "../../store/ReviewandSubmit/actions";
import SendIcon from '@mui/icons-material/Send';
import { useOfflineSync } from '../../systemAvailability/useOfflineSync';
import { isAllStepsCompleted } from '../../store/FormSteps/selectors';

const ReviewInspectionPage: React.FC = () => {
  const dispatch = useDispatch();
  const isOnline = useOfflineSync();

  const { goTo } = useNavigationManager();

  const isAllCompleted = useSelector(isAllStepsCompleted);

  const inspection = useSelector(getInspection);
  const ratedElements = useSelector(getRatedElements);
  const maintenanceActions = useSelector(getMaintenanceAction);
  const comments = useSelector(getInspectionComment);

  useEffect(() => {
    dispatch({
      type: stepActions.SET_REVIEW_COMPLETE
    } as PayloadAction);
  }, [])

  const handleReviewEditSection = (step: number, route: RoutesValueEnum) => {
    dispatch({
      payload: step,
      type: stepActions.SET_ACTIVE_STEP
    } as PayloadAction<number>);

    goTo(route);
  }

  const handleSubmitOnclick = () => {
    dispatch({
      type: reviewActions.SUBMIT_DATA
    } as PayloadAction);

    goTo(RoutesValueEnum.Home);
  }

  return (
    <FormPageWrapper>
      <Container maxWidth="md">
        <Box mt={4}>
          <Paper elevation={8} className={styles.papaerContainer}>

            <Box mb={2}>
              <Box className={styles.reviewHeaderContainer}>
                <Typography variant="h6">1 - Inspection Detail</Typography>
                <IconButton onClick={() => handleReviewEditSection(0, RoutesValueEnum.InspectionDetail)}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body1">Level of Inspection: {inspection.inspectionLevel}</Typography>
                  <Typography variant="body1">Inspection Type: {inspection.inspectionType}</Typography>
                  <Typography variant="body1">Temperature (degrees): {inspection.temperature}</Typography>
                  <Typography variant="body1">Inspector Name: {inspection.inspectorName}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">Inspection date: {inspection.inspectionDate}</Typography>
                  <Typography variant="body1">Proposed date of next inspection: {inspection.nextInspectionProposedDate}</Typography>
                  <Typography variant="body1">Weather: {inspection.weather}</Typography>
                  <Typography variant="body1">Engineer name: {inspection.engineerName}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={8} className={styles.papaerContainer}>
            <Box mb={2}>
              <Box className={styles.reviewHeaderContainer}>
                <Typography variant="h6">2 - Condition Rating</Typography>
                <IconButton onClick={() => handleReviewEditSection(1, RoutesValueEnum.ConditionRating)}>
                  <EditIcon />
                </IconButton>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Total qty</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell>Condition rating (1 2 3 4)</TableCell>
                      <TableCell>Elem. Cod.</TableCell>
                      <TableCell>ECI Chan.</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratedElements?.map((item, index) => {
                      return (
                        <TableRow key={`${item.elementId}-${index}`}>
                          <TableCell className={styles.tableCell}>{item.code}</TableCell>
                          <TableCell className={styles.tableCell}>{item.description}</TableCell>
                          <TableCell className={styles.tableCell}>{item.quantity}</TableCell>
                          <TableCell className={styles.tableCell}>{item.unit}</TableCell>
                          <TableCell className={styles.tableCell}>{item.condition?.concat()}</TableCell>
                          <TableCell className={styles.tableCell}>{item.elementCode}</TableCell>
                          <TableCell className={styles.tableCell}>{item.eciChannel}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

            </Box>
          </Paper>

          <Paper elevation={8} className={styles.papaerContainer}>
            <Box mb={2}>
              <Box className={styles.reviewHeaderContainer}>
                <Typography variant="h6">3 - Req’s Maint. Actions</Typography>

                <IconButton onClick={() => handleReviewEditSection(1, RoutesValueEnum.ConditionRating)}>
                  <EditIcon />
                </IconButton>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Element</TableCell>
                      <TableCell>Activity Descrip.</TableCell>
                      <TableCell>Inspection Comments</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell>Date of completion</TableCell>
                      <TableCell>Probability</TableCell>
                      <TableCell>Consequence</TableCell>
                      <TableCell>Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceActions?.map((item, index) => {
                      return (
                        <TableRow key={`${item.id}-${index}`}>
                          <TableCell className={styles.tableCell}>{item.elementCode}</TableCell>
                          <TableCell className={styles.tableCell}>{item.activityDescription}</TableCell>
                          <TableCell className={styles.tableCell}>{item.inspectionComment}</TableCell>
                          <TableCell className={styles.tableCell}>{item.units}</TableCell>
                          <TableCell className={styles.tableCell}>{item.dateForCompletion}</TableCell>
                          <TableCell className={styles.tableCell}>{item.probability}</TableCell>
                          <TableCell className={styles.tableCell}>{item.consequenceOfInteraction}</TableCell>
                          <TableCell className={styles.tableCell}>{item.activityInactionRisk}</TableCell>
                        </TableRow>
                      )
                    })}

                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>

          <Paper elevation={8} className={styles.papaerContainer}>
            <Box mb={2}>
              <Box className={styles.reviewHeaderContainer}>
                <Typography variant="h6">4 - Inspector Comments</Typography>
                <IconButton onClick={() => handleReviewEditSection(2, RoutesValueEnum.InspectorComments)}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1">
                {comments}
              </Typography>
            </Box>
          </Paper>

        </Box>
        <Box display="flex" justifyContent="flex-end" margin="20px 0px">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmitOnclick}
            disabled={(!isAllCompleted || !isOnline)}
          >
            Review and Submit Data
          </Button>
        </Box>
      </Container>
    </FormPageWrapper>
  );
};

export default ReviewInspectionPage;
