import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid2 as Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getInspectCommentFormValidation, getInspectionComment } from '../../store/InspectionComment/selectors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/InspectionComment/actions";
import AIChatBot from '../../components/aiChatBot';
import { genAIService } from '../../services/genAIService';
import { getInspection } from '../../store/Inspection/selectors';
import { getCurrentStructure, getIFCCalculatedElementCodeData } from '../../store/Structure/selectors';
import { getMaintenanceActions } from '../../store/MaintenanceAction/selectors';
import { getRatedElementCodeData, getRatedElements } from '../../store/ConditionRating/selectors';
import * as commonActions from "../../store/Common/actions";
import { InspectionReport } from '../../entities/genAIModel';
import { IFCPopulatedConditionRating } from '../../entities/inspection';
import { getRatingDistribution } from '../../helper/ifcTreeManager';

const InspectorCommentForm: React.FC = () => {
  const dispatch = useDispatch();
  const [ifcPopulatedConditionRating, setIFCPopulatedConditionRating] = useState<IFCPopulatedConditionRating[]>([]);

  const commentValue = useSelector(getInspectionComment);
  const validationError = useSelector(getInspectCommentFormValidation);

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

  const handleGenerateAI = async () => {
    dispatch({ type: commonActions.SHOW_LOADING_OVERLAY } as PayloadAction);
    setIsGeneratingAI(true);
    setAiError(null);

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
        }))
      };

      // Call the completion API
      const contextJson = JSON.stringify(inspectionContext);
      const aiComment: InspectionReport = await genAIService.getCompletion(contextJson);

      // Update the comment field with AI generated content
      dispatch({
        type: actions.SET_INSPECTION_COMMENT_DATA,
        payload: aiComment.response
      } as PayloadAction<string>);

    } catch (error) {
      console.error('Error generating AI comment:', error);
      setAiError('Failed to generate AI comment. Please try again.');
    } finally {
      setIsGeneratingAI(false);
      dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);

    }
  };

  // Handle chat completion for the chatbot
  //might need to remove it
  const handleChatCompletion = async (contextJson: string): Promise<InspectionReport> => {
    // For chat, we might want to include additional context
    const chatContext = {
      currentComment: commentValue,
      ...currentInspection,
      structure: currentStructure
    };

    const fullContext = JSON.stringify(chatContext);
    return await genAIService.sendChatMessage("Help me with this inspection", fullContext);
  };

  return (
    <FormPageWrapper isFooterVisible={true}>
      <Container maxWidth="md">
        <Box mt={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={6}>
              <Typography variant="body1">4- Inspection's Comment</Typography>
            </Grid>

            <Grid size={6} textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                startIcon={isGeneratingAI ? <CircularProgress size={20} /> : null}
              >
                {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Grid>

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
      <AIChatBot onGetCompletion={handleChatCompletion} />
    </FormPageWrapper>
  );
};

export default InspectorCommentForm;