import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getInspection } from '../../store/Inspection/selectors';
import { getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { getInspectionComment } from '../../store/InspectionComment/selectors';
import { getRatedElementCodeData, getRatedElements } from '../../store/ConditionRating/selectors';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as stepActions from "../../store/FormSteps/actions";
import * as reviewActions from "../../store/ReviewandSubmit/actions";
import SendIcon from '@mui/icons-material/Send';
import { useOfflineSync } from '../../systemAvailability/useOfflineSync';
import { isAllStepsCompleted } from '../../store/FormSteps/selectors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormatDateOnly } from '../../helper/util';
import { getIFCCalculatedElementCodeData } from '../../store/Structure/selectors';
import { getRatingDistribution } from '../../helper/ifcTreeManager';
import { IFCPopulatedConditionRating } from '../../entities/inspection';
import { SubmitDatapayload } from '../../models/submitDataModel';
import ImageIcon from '@mui/icons-material/Image';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import ImageCarousel from '../../components/imageCarousel';

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

const ReviewInspectionPage: React.FC = () => {
  const dispatch = useDispatch();
  const isOnline = useOfflineSync();
  const { goTo } = useNavigationManager();

  const [ifcPopulatedConditionRating, setIFCPopulatedConditionRating] = useState<IFCPopulatedConditionRating[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const isAllCompleted = useSelector(isAllStepsCompleted);
  const inspection = useSelector(getInspection);
  const ratedIFCElements = useSelector(getRatedElements);
  const ifcCalculatedElementCodeData = useSelector(getIFCCalculatedElementCodeData);
  const ratedStructureElements = useSelector(getRatedElementCodeData);
  const maintenanceActions = useSelector(getMaintenanceActions);
  const comments = useSelector(getInspectionComment);

  useEffect(() => {
    if (ifcCalculatedElementCodeData) {
      setIFCPopulatedConditionRating(getRatingDistribution(ifcCalculatedElementCodeData, ratedIFCElements));
    }

  }, [ratedIFCElements, ifcCalculatedElementCodeData])

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
      type: reviewActions.SUBMIT_DATA,
      payload: {
        ifcPopulatedConditionRating: ifcPopulatedConditionRating,
        callback: () => goTo(RoutesValueEnum.Home)
      }
    } as PayloadAction<SubmitDatapayload>);
  }

  const handleImageClick = (images: string[]) => {
    if (images && images.length > 0) {
      setSelectedImages(images);
      setIsCarouselOpen(true);
    }
  };

  return (
    <FormPageWrapper isFooterVisible={true}>
      <Box mt={4} sx={{ margin: '0px 32px' }} >

        {/* Inspection Details Section */}
        <ReportSection defaultExpanded>
          <SectionHeader
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              1 - Inspection Detail
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEditSection(0, RoutesValueEnum.InspectionDetail);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </SectionHeader>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={6}>
                <DetailLabel>Level of Inspection</DetailLabel>
                <DetailValue>{inspection?.inspectionLevel}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspection Level</DetailLabel>
                <DetailValue>{inspection?.inspectionLevel}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspection Type</DetailLabel>
                <DetailValue>{inspection?.inspectionType}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Proposed date of next inspection</DetailLabel>
                <DetailValue>{FormatDateOnly(inspection?.nextInspectionProposedDate)}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Temperature (degrees)</DetailLabel>
                <DetailValue>{inspection?.temperature}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Weather</DetailLabel>
                <DetailValue>{inspection?.weather}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Inspector Name</DetailLabel>
                <DetailValue>{inspection?.inspectorName}</DetailValue>
              </Grid>
              <Grid size={6}>
                <DetailLabel>Engineer Name</DetailLabel>
                <DetailValue>{inspection?.engineerName}</DetailValue>
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
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEditSection(1, RoutesValueEnum.ConditionRating);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </SectionHeader>
          <AccordionDetails>
            <TableContainer>
              {ratedStructureElements?.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell>Code</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Description</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Total Qty</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Unit</StyledTableHeaderCell>
                      <StyledTableHeaderCell align='center'>
                        Condition rating
                        <Stack direction={'row'} spacing={0} sx={{ justifyContent: 'space-between', width: '100%' }}>
                          {[1, 2, 3, 4].map((rating) => (
                            <Box key={rating} sx={{ width: '25%', textAlign: 'center' }}>
                              <Typography variant="caption">
                                CS{rating}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratedStructureElements?.map((row, index) => (
                      <TableRow key={index}>
                        <StyledTableCell>{row.elementCode}</StyledTableCell>
                        <StyledTableCell>{row.description}</StyledTableCell>
                        <StyledTableCell>{row.totalQty}</StyledTableCell>
                        <StyledTableCell>{row.unit}</StyledTableCell>
                        <StyledTableCell>
                          <Stack direction={'row'} spacing={0} sx={{ justifyContent: 'space-between', width: '100%' }}>
                            {row.condition?.map((value, i) => (
                              <Box key={i} sx={{ width: '25%', textAlign: 'center' }}>
                                {value}
                              </Box>
                            ))}
                          </Stack>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {ratedIFCElements?.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableHeaderCell>Code</StyledTableHeaderCell>
                      <StyledTableHeaderCell>Total Qty</StyledTableHeaderCell>
                      <StyledTableHeaderCell align='center'>
                        Condition rating
                        <Stack direction={'row'} spacing={0} sx={{ justifyContent: 'space-between', width: '100%' }}>
                          {[1, 2, 3, 4].map((rating) => (
                            <Box key={rating} sx={{ width: '25%', textAlign: 'center' }}>
                              <Typography variant="caption">
                                CS{rating}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </StyledTableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ifcPopulatedConditionRating?.map((row, index) => (
                      <TableRow key={index}>
                        <StyledTableCell>{row.elementCode}</StyledTableCell>
                        <StyledTableCell>{row.totalQty}</StyledTableCell>
                        <StyledTableCell>
                          <Stack direction={'row'} spacing={0} sx={{ justifyContent: 'space-between', width: '100%' }}>
                            {row.condition?.map((value, i) => (
                              <Box key={i} sx={{ width: '25%', textAlign: 'center' }}>
                                {value}
                              </Box>
                            ))}
                          </Stack>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEditSection(1, RoutesValueEnum.ConditionRating);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
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
                    <StyledTableHeaderCell align="center">Images</StyledTableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceActions?.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell>{row.elementCode}</StyledTableCell>
                      <StyledTableCell>{row.mmsActNo}</StyledTableCell>
                      <StyledTableCell>{row.activityDescription}</StyledTableCell>
                      <StyledTableCell>{row.inspectionComment}</StyledTableCell>
                      <StyledTableCell>{row.units}</StyledTableCell>
                      <StyledTableCell>{FormatDateOnly(row.dateForCompletion)}</StyledTableCell>
                      <StyledTableCell>{row.probability}</StyledTableCell>
                      <StyledTableCell>{row.consequenceOfInteraction}</StyledTableCell>
                      <StyledTableCell>{row.activityInactionRisk}</StyledTableCell>
                      <StyledTableCell align="center">
                        <IconButton
                          onClick={() => handleImageClick(row.photos?.map(photo => photo.url) || [])}
                          disabled={!row.photos || row.photos.length === 0}
                          sx={{
                            color: row.photos && row.photos.length > 0 ? 'primary.main' : 'action.disabled'
                          }}
                        >
                          {row.photos && row.photos.length > 0 ? <ImageIcon /> : <ImageNotSupportedIcon />}
                        </IconButton>
                      </StyledTableCell>
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
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEditSection(2, RoutesValueEnum.InspectorComments);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </SectionHeader>
          <AccordionDetails>
            <Box sx={{ py: 1 }}>
              <Typography variant="body1">
                {comments}
              </Typography>
            </Box>
          </AccordionDetails>
        </ReportSection>

      </Box>

      <Box display="flex" justifyContent="flex-end" margin="20px 20px">
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSubmitOnclick}
          disabled={(!isAllCompleted || !isOnline)}
        >
          Review and Submit Data
        </Button>
      </Box>

      <ImageCarousel
        open={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
        images={selectedImages}
      />
    </FormPageWrapper>
  );
};

export default ReviewInspectionPage;
