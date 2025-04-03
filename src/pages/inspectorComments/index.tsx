import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid2 as Grid
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getInspectCommentFormValidation, getInspectionComment } from '../../store/InspectionComment/selectors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/InspectionComment/actions";

const InspectorCommentForm: React.FC = () => {
  const dispatch = useDispatch();

  const commentValue = useSelector(getInspectionComment);
  const validationError = useSelector(getInspectCommentFormValidation);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: actions.SET_INSPECTION_COMMENT_DATA,
      payload: e.target.value
    } as PayloadAction<string>)
  };

  const handleGenerateAI = () => {
    console.log('Generate AI for the comment');
  };

  return (
    <FormPageWrapper isFooterVisible={true}>
      <Container maxWidth="md">
        <Box mt={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={6}>
              <Typography variant="body1">4- Inspection’s Comment</Typography>
            </Grid>

            <Grid size={6} textAlign="right">
              <Button variant="contained" color="primary" onClick={handleGenerateAI}>
                Generate with AI
              </Button>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter your comment here..."
                value={commentValue}
                onChange={handleCommentChange}
                error={validationError}
                helperText={(validationError) ? "please fill in inspection comment" : ""}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </FormPageWrapper>
  );
};

export default InspectorCommentForm;
