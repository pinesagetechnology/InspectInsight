import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid2 as Grid,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Stack,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Cloud as CloudIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getAiSource, getAiSourceStatus, getInspectCommentFormValidation, getInspectionComment } from '../../store/InspectionComment/selectors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/InspectionComment/actions";
import AIChatBot from '../../components/aiChatBot';
import { getInspection } from '../../store/Inspection/selectors';
import { getCurrentStructure, getIFCCalculatedElementCodeData, getStructureDisplayMode, getTotalElementCodeQuantity, getTotalIFCElementQuantity } from '../../store/Structure/selectors';
import { getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { getRatedElementCodeData, getRatedElements } from '../../store/ConditionRating/selectors';
import * as commonActions from "../../store/Common/actions";
import { IFCPopulatedConditionRating, InspectionEntity } from '../../entities/inspection';
import { getRatingDistribution } from '../../helper/ifcTreeManager';
import { AISource, AISourceStatus } from '../../models/webllm';
import { aiSummaryServiceAdapter } from '../../services/aiSummaryServiceAdapter';

const InspectorCommentForm: React.FC = () => {
  const dispatch = useDispatch();
  const [ifcPopulatedConditionRating, setIFCPopulatedConditionRating] = useState<IFCPopulatedConditionRating[]>([]);

  const commentValue = useSelector(getInspectionComment);
  const validationError = useSelector(getInspectCommentFormValidation);
  const structureDataMode = useSelector(getStructureDisplayMode);
  const totalIFCElementQuantity = useSelector(getTotalIFCElementQuantity);
  const totalElementCodeQuantity = useSelector(getTotalElementCodeQuantity);

  // Get inspection context for AI
  const currentInspection = useSelector(getInspection);
  const currentStructure = useSelector(getCurrentStructure);
  const maintenanceActions = useSelector(getMaintenanceActions);
  const ratedIFCElements = useSelector(getRatedElements);
  const ifcCalculatedElementCodeData = useSelector(getIFCCalculatedElementCodeData);
  const ratedElementCodeData = useSelector(getRatedElementCodeData);

  // Local state for AI operations
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiSource = useSelector(getAiSource);
  const aiStatus = useSelector(getAiSourceStatus);

  useEffect(() => {
    aiSummaryServiceAdapter.setSource(aiSource);
  }, []);

  useEffect(() => {
    checkAIStatus();
  }, [aiSource]);

  const checkAIStatus = async () => {
    try {
      const status = await aiSummaryServiceAdapter.getStatus();
      dispatch({ type: actions.SET_AI_SOURCE_STATUS, payload: status } as PayloadAction<AISourceStatus>);
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  useEffect(() => {
    if (ifcCalculatedElementCodeData) {
      setIFCPopulatedConditionRating(getRatingDistribution(ifcCalculatedElementCodeData, ratedIFCElements));
    }
  }, [ratedIFCElements, ifcCalculatedElementCodeData]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: actions.SET_INSPECTION_COMMENT_DATA,
      payload: e.target.value
    } as PayloadAction<string>)
  };

  const handleAISourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSource = event.target.value as AISource;
    dispatch({ type: actions.SET_AI_SOURCE, payload: newSource } as PayloadAction<AISource>);
    aiSummaryServiceAdapter.setSource(newSource);
    checkAIStatus(); // Re-check status when source changes
  };

  const handleGenerateAI = async () => {
    dispatch({ type: commonActions.SHOW_LOADING_OVERLAY } as PayloadAction);
    setIsGeneratingAI(true);
    setAiError(null);

    let inspectionRatingProgress = "";
    if (structureDataMode === "ifc") {
      inspectionRatingProgress = `${ratedIFCElements.length} of ${totalIFCElementQuantity} elements rated`;
    } else {
      inspectionRatingProgress = `${ratedElementCodeData.length} of ${totalElementCodeQuantity} elements rated`;
    }

    try {
      // Prepare inspection context for AI
      const inspectionContext = {
        structure: {
          name: currentStructure.name,
          code: currentStructure.code,
          type: currentStructure.type
        },
        inspection: {
          inspectionDate: currentInspection.inspectionDate,
          inspectionType: currentInspection.inspectionType,
          inspectionLevel: currentInspection.inspectionLevel,
          weather: currentInspection.weather,
          temperature: currentInspection.temperature,
          inspectorName: currentInspection.inspectorName,
          engineerName: currentInspection.engineerName
        },
        conditionRatings: (ratedElementCodeData && ratedElementCodeData.length) ?
          ratedElementCodeData.map(element => ({
            elementCode: element.elementCode,
            description: element.description,
            condition: element.condition,
            quantity: element.totalQty,
          }))
          :
          ifcPopulatedConditionRating.map(element => ({
            elementCode: element.elementCode,
            condition: element.condition,
            quantity: element.totalQty,
          }))
        ,
        maintenanceActions: maintenanceActions.map(action => ({
          elementCode: action.elementCode,
          activityDescription: action.activityDescription,
          inspectionComment: action.inspectionComment,
          probability: action.probability,
          consequence: action.consequenceOfInteraction,
          risk: action.activityInactionRisk
        })),
        inspectionRatingProgress: inspectionRatingProgress
      };

      const previousInspectionJson = {
        inspectionType: currentStructure.previousInspection?.inspectionType,
        inspectionLevel: currentStructure.previousInspection?.inspectionLevel,
        temperature: currentStructure.previousInspection?.temperature,
        weather: currentStructure.previousInspection?.weather,
        inspectorName: currentStructure.previousInspection?.inspectorName,
        engineerName: currentStructure.previousInspection?.engineerName,
        inspectionDate: currentStructure.previousInspection?.inspectionDate,
        nextInspectionProposedDate: currentStructure.previousInspection?.nextInspectionProposedDate,
        inspectionComment: currentStructure.previousInspection?.comment,
        maintenanceActions: currentStructure.previousInspection?.maintenanceActions,
        conditionRatings: currentStructure.previousInspection?.conditionRatings,
      };

      const aiResponse = await aiSummaryServiceAdapter.sendGetCompletion(inspectionContext, previousInspectionJson);

      dispatch({
        type: actions.SET_INSPECTION_COMMENT_DATA,
        payload: aiResponse.response
      } as PayloadAction<string>);

    } catch (error) {
      console.error('Error generating AI comment:', error);
      setAiError(`Failed to generate AI comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
      dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);
    }
  };

  return (
    <FormPageWrapper isFooterVisible={true}>
      <Container maxWidth="md">
        <Box mt={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={4}>
              <Typography variant="body1">4- Inspection's Comment</Typography>
            </Grid>

            <Grid size={5}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                {/* AI Source Selection */}
                <FormControl component="fieldset" size="small">
                  <RadioGroup
                    row
                    value={aiSource}
                    onChange={handleAISourceChange}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <FormControlLabel
                      value="online"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CloudIcon fontSize="small" />
                          <Typography variant="body2">Online</Typography>
                          {aiStatus?.online?.available ? (
                            <WifiIcon fontSize="small" color="success" />
                          ) : (
                            <WifiOffIcon fontSize="small" color="error" />
                          )}
                        </Stack>
                      }
                      disabled={!aiStatus?.online?.available}
                    />
                    <FormControlLabel
                      value="local"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <ComputerIcon fontSize="small" />
                          <Typography variant="body2">Local</Typography>
                          {aiStatus?.local?.available ? (
                            <Chip
                              label={aiStatus?.local?.modelName || 'Ready'}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="Not Ready"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      }
                      disabled={!aiStatus?.local?.available}
                    />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={3}>
              {/* Generate AI Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || (aiSource === 'local' && !aiStatus?.local?.available) || (aiSource === 'online' && !aiStatus?.online?.available)}
                startIcon={isGeneratingAI ? <CircularProgress size={20} /> : null}
              >
                {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Grid>

            {/* Status Alerts */}
            {aiSource === 'local' && aiStatus && !aiStatus?.local?.available && (
              <Grid size={12}>
                <Alert severity="warning" onClose={() => { }}>
                  <strong>Local AI Not Available:</strong> {
                    !aiStatus?.local?.webGPUSupported
                      ? 'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.'
                      : 'No local model is ready. Please download a model from settings.'
                  }
                </Alert>
              </Grid>
            )}

            {aiSource === 'online' && aiStatus && !aiStatus?.online?.available && (
              <Grid size={12}>
                <Alert severity="warning" onClose={() => { }}>
                  <strong>Online AI Not Available:</strong> {
                    !aiStatus?.online?.authenticated
                      ? 'Please log in to use online AI.'
                      : 'No internet connection. Please check your network.'
                  }
                </Alert>
              </Grid>
            )}

            {aiError && (
              <Grid size={12}>
                <Alert severity="error" onClose={() => setAiError(null)}>
                  {aiError}
                </Alert>
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={20}
                variant="outlined"
                placeholder="Enter your comment here..."
                value={commentValue}
                onChange={handleCommentChange}
                error={validationError}
                helperText={(validationError) ? "please fill in inspection comment" : ""}
                disabled={isGeneratingAI}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* AI Chat Bot */}
      <AIChatBot />
    </FormPageWrapper>
  );
};

export default InspectorCommentForm;