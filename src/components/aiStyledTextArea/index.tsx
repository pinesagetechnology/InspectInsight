import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Collapse,
  Button,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AISource } from '../../models/webllm';
import AIResponseDisplay from '../aiResponseDisplay';

interface AIStyledTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  aiSource?: AISource;
  aiModelName?: string;
  showAIResponse?: boolean;
  onToggleAIView?: () => void;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const TextAreaContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.grey[50],
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
      },
    },
  },
}));

const AIResponseOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const AIStyledTextArea: React.FC<AIStyledTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Enter your comment here...",
  rows = 20,
  error = false,
  helperText = "",
  disabled = false,
  aiSource = 'online',
  aiModelName,
  showAIResponse = false,
  onToggleAIView,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Auto-hide AI view when user starts editing
  useEffect(() => {
    if (isEditing && showAIResponse && onToggleAIView) {
      onToggleAIView();
    }
  }, [isEditing, showAIResponse, onToggleAIView]);

  const hasAIResponse = value.trim().length > 0;

  // Check if content looks like it has markdown formatting
  const hasMarkdownFormatting = value.includes('**') || value.includes('*') || value.includes('#') || value.includes('- ') || value.includes('```');

  return (
    <StyledContainer>
      {/* AI Response Display */}
      {showAIResponse && hasAIResponse && !isEditing && (
        <AIResponseOverlay>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.palette.grey[50]
            }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {/* <BotIcon color="primary" fontSize="small" /> */}
                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                  AI Generated Response
                </Typography>
                {/* <Chip
                  label={aiModelName || (aiSource === 'local' ? 'Local AI' : 'Online AI')}
                  size="small"
                  color={aiSource === 'local' ? 'success' : 'primary'}
                  variant="outlined"
                /> */}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Copy response">
                  <IconButton size="small" onClick={handleCopy} color="primary">
                    {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit response">
                  <IconButton size="small" onClick={handleEdit} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onToggleAIView && (
                  <Tooltip title="Hide AI view">
                    <IconButton size="small" onClick={onToggleAIView} color="primary">
                      <HideIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <AIResponseDisplay
                content={value}
                source={aiSource}
                modelName={aiModelName}
                timestamp={new Date()}
              />
            </Box>
          </Box>
        </AIResponseOverlay>
      )}

      {/* Edit Mode Controls */}
      {isEditing && (
        <Box sx={{ 
          mb: 1, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1 
        }}>
          <Button size="small" onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button size="small" onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      )}

      {/* Text Field */}
      <TextAreaContainer>
        <TextField
          fullWidth
          multiline
          rows={rows}
          variant="outlined"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          helperText={helperText}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: isEditing ? 'inherit' : 'monospace',
              fontSize: isEditing ? 'inherit' : '0.9rem',
              lineHeight: isEditing ? 'inherit' : 1.4,
            }
          }}
        />
      </TextAreaContainer>

      {/* AI Response Toggle Button */}
      {hasAIResponse && !showAIResponse && onToggleAIView && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {hasMarkdownFormatting && (
            <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BotIcon fontSize="small" />
              AI formatted content detected
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={onToggleAIView}
            variant="outlined"
            color="primary"
          >
            View AI Response
          </Button>
        </Box>
      )}
    </StyledContainer>
  );
};

export default AIStyledTextArea; 