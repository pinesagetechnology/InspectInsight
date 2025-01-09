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
  Box,
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import styles from "./style.module.scss";
import { getPreviousInspection, getPreviousInspectionRatedElement } from '../../store/Inspection/selectors';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/Inspection/actions";

const PreviousInspectionPage: React.FC = () => {
  const { goTo } = useNavigationManager();
  const dispatch = useDispatch();

  const previousInspect = useSelector(getPreviousInspection);
  const ratedElements = useSelector(getPreviousInspectionRatedElement);

  useEffect(() => {
    dispatch({
      type: actions.REVIEW_PREVIOUS_INSPECTION_DATA
    });
  }, [])

  const handleSubmitOnclick = () => {
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
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body1">Level of Inspection: {previousInspect?.inspectionLevel}</Typography>
                  <Typography variant="body1">Inspection Type: {previousInspect?.inspectionType}</Typography>
                  <Typography variant="body1">Temperature (degrees): {previousInspect?.temperature}</Typography>
                  <Typography variant="body1">Inspector Name: {previousInspect?.inspectorName}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1">Inspection date: {previousInspect?.inspectionDate}</Typography>
                  <Typography variant="body1">Proposed date of next inspection: {previousInspect?.nextInspectionProposedDate}</Typography>
                  <Typography variant="body1">Weather: {previousInspect?.weather}</Typography>
                  <Typography variant="body1">Engineer name: {previousInspect?.engineerName}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={8} className={styles.papaerContainer}>
            <Box mb={2}>
              <Box className={styles.reviewHeaderContainer}>
                <Typography variant="h6">2 - Condition Rating</Typography>
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
                    {previousInspect?.maintenanceActions?.map((item, index) => {
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
              </Box>
              <Typography variant="body1">
                {previousInspect?.comment}
              </Typography>
            </Box>
          </Paper>

        </Box>

      </Container>
    </FormPageWrapper>
  );
};

export default PreviousInspectionPage;
