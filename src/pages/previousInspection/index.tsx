import React, { useEffect } from 'react';
import {
  Typography,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { selectedPreviousInspectionData, getPreviousInspectionRatedElement } from '../../store/Inspection/selectors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StructureElement } from '../../entities/structure';

// Styled components
const ReportSection = styled(Accordion)(({ theme }) => ({
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(3),
  '&.MuiAccordion-root': {
    '&:before': {
      display: 'none',
    },
  },
}));

const SectionHeader = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '48px',
  '& .MuiAccordionSummary-content': {
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(1, 0),
  },
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 'medium',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 500,
}));

const PreviousInspectionPage: React.FC = () => {

  const previousInspect = useSelector(selectedPreviousInspectionData);
  console.log('Previous Inspection Data:', previousInspect);
  const ratedElements: StructureElement[] = useSelector(getPreviousInspectionRatedElement);

  return (
    <FormPageWrapper isFooterVisible={false}>
      <Box mt={4}>
        {/* Inspection Details Section */}
        <ReportSection defaultExpanded>
          <SectionHeader
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              1 - Inspection Detail
            </Typography>
          </SectionHeader>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={6}>
                <DetailLabel>Level of Inspection</DetailLabel>
                <DetailValue>{previousInspect?.inspectionLevel}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspection Level</DetailLabel>
                <DetailValue>{previousInspect?.inspectionLevel}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspection Type</DetailLabel>
                <DetailValue>{previousInspect?.inspectionType}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Proposed date of next inspection</DetailLabel>
                <DetailValue>{previousInspect?.nextInspectionProposedDate}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Temperature (degrees)</DetailLabel>
                <DetailValue>{previousInspect?.temperature}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Weather</DetailLabel>
                <DetailValue>{previousInspect?.weather}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspector Name</DetailLabel>
                <DetailValue>{previousInspect?.inspectorName}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Engineer Name</DetailLabel>
                <DetailValue>{previousInspect?.engineerName}</DetailValue>
              </Grid>
            </Grid>
          </AccordionDetails>
        </ReportSection>

        {/* Condition Rating Section */}
        <ReportSection defaultExpanded>
          <SectionHeader
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              2 - Condition Rating
            </Typography>
          </SectionHeader>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Entity</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Name</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Quantity</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Condition rating (1,2,3,4)</StyledTableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratedElements?.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell>{row.data.expressID}</StyledTableCell>
                      <StyledTableCell>{row.data.Entity}</StyledTableCell>
                      <StyledTableCell>{row.data.Name}</StyledTableCell>
                      <StyledTableCell>{row.quantity}</StyledTableCell>
                      <StyledTableCell>{row.condition?.join(',')}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </ReportSection>
        {/* 

        {/* Maintenance Actions Section */}
        <ReportSection defaultExpanded>
          <SectionHeader
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              3 - Req's Maint. Actions
            </Typography>
          </SectionHeader>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableHeaderCell>Element</StyledTableHeaderCell>
                    <StyledTableHeaderCell>MMS Act.</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Activity Descrip.</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Inspection Comments</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Units</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Date of completion</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Probability</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Consequen.</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Activity</StyledTableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previousInspect?.maintenanceActions?.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell>{row.elementCode}</StyledTableCell>
                      <StyledTableCell>{row.mmsActNo}</StyledTableCell>
                      <StyledTableCell>{row.activityDescription}</StyledTableCell>
                      <StyledTableCell>{row.inspectionComment}</StyledTableCell>
                      <StyledTableCell>{row.units}</StyledTableCell>
                      <StyledTableCell>{row.dateForCompletion}</StyledTableCell>
                      <StyledTableCell>{row.probability}</StyledTableCell>
                      <StyledTableCell>{row.consequenceOfInteraction}</StyledTableCell>
                      <StyledTableCell>{row.activityInactionRisk}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </ReportSection>

        {/* Inspector Comments Section */}
        <ReportSection defaultExpanded>
          <SectionHeader
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              4 - Inspector Comments
            </Typography>
          </SectionHeader>
          <AccordionDetails>
            <Box sx={{ py: 1 }}>
              <Typography variant="body1">
                {previousInspect?.comment}
              </Typography>
            </Box>
          </AccordionDetails>
        </ReportSection>

      </Box>

    </FormPageWrapper>
  );
};

export default PreviousInspectionPage;
