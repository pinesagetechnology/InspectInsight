import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AISource } from '../../models/webllm';

interface AIResponseDisplayProps {
  content: string;
  source?: AISource;
  modelName?: string;
  timestamp?: Date;
  onCopy?: () => void;
  copied?: boolean;
}

const ResponseContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.5),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const ContentSection = styled(Box)(({ theme }) => ({
  '& p': {
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.6,
    color: theme.palette.text.primary,
    fontSize: '0.95rem',
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& h1': { fontSize: '1.5rem' },
  '& h2': { fontSize: '1.3rem' },
  '& h3': { fontSize: '1.1rem' },
  '& ul, & ol': {
    marginBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
    lineHeight: 1.5,
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(1.5, 0),
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
  },
  '& code': {
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(0.25, 0.5),
    borderRadius: theme.shape.borderRadius * 0.5,
    fontFamily: 'monospace',
    fontSize: '0.9em',
    color: theme.palette.text.primary,
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    margin: theme.spacing(1.5, 0),
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  '& pre code': {
    backgroundColor: 'transparent',
    padding: 0,
  },
  '& strong, & b': {
    fontWeight: 600,
  },
  '& em, & i': {
    fontStyle: 'italic',
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: theme.spacing(1.5, 0),
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(0.75),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
  },
  '& .highlight': {
    backgroundColor: theme.palette.warning.light,
    padding: theme.spacing(0.25, 0.5),
    borderRadius: theme.shape.borderRadius * 0.5,
  },
}));

const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({
  content,
  source = 'online',
  modelName,
  timestamp,
  onCopy,
  copied = false,
}) => {
  const theme = useTheme();

  const formatContent = (text: string): string => {
    // Convert markdown-like formatting to HTML
    return text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      // Wrap lists in ul/ol tags
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Wrap in paragraph tags
      .replace(/^(.*)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      // Clean up consecutive paragraph tags
      .replace(/<\/p><p>/g, '</p><p>')
      // Clean up list formatting
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><\/p>/g, '</ul>')
      .replace(/<p><li>/g, '<li>')
      .replace(/<\/li><\/p>/g, '</li>');
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(content);
    }
  };

  const getSourceIcon = () => {
    return source === 'local' ? '🖥️' : '☁️';
  };

  const getSourceColor = () => {
    return source === 'local' ? 'success' : 'primary';
  };

  const getSourceLabel = () => {
    return source === 'local' ? 'Local AI' : 'Online AI';
  };

  return (
    <ResponseContainer elevation={1}>
      <HeaderSection>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* <BotIcon color="primary" fontSize="small" /> */}
          <Typography variant="subtitle2" color="primary" fontWeight={600}>
            AI Assistant
          </Typography>
          {/* <Chip
            icon={<span>{getSourceIcon()}</span>}
            label={modelName || getSourceLabel()}
            size="small"
            color={getSourceColor() as any}
            variant="outlined"
          /> */}
          {timestamp && (
            <Typography variant="caption" color="text.secondary">
              {timestamp.toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
        
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Copy response">
            <IconButton size="small" onClick={handleCopy} color="primary">
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </HeaderSection>

      <ContentSection
        dangerouslySetInnerHTML={{
          __html: formatContent(content)
        }}
      />
    </ResponseContainer>
  );
};

export default AIResponseDisplay; 