import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    TextField,
    Typography,
    Avatar,
    Collapse,
    Stack,
    CircularProgress,
    Fab,
    useTheme,
    useMediaQuery,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Chip,
    Alert,
    AlertTitle,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    Computer as ComputerIcon,
    Cloud as CloudIcon,
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { chatAIServiceAdapter } from '../../services/chatAIServiceAdapter';
import { InspectionReport } from '../../entities/genAIModel';
import { AIResponse, AISource } from '../../models/webllm';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    source?: AISource;
    modelName?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 400, // Increased width to accommodate radio buttons
    maxHeight: 600, // Increased height
    boxShadow: theme.shadows[8],
    transition: 'all 0.3s ease-in-out',
    zIndex: 1000,
    [theme.breakpoints.down('sm')]: {
        width: 'calc(100vw - 32px)',
        right: 16,
        left: 16,
        bottom: 80, // Leave space for bottom navigation
    },
}));

const ChatContainer = styled(Box)(({ theme }) => ({
    height: 350, // Increased height
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    scrollBehavior: 'smooth',
    '&::-webkit-scrollbar': {
        width: '4px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
    },
}));

const MessageBubble = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'role',
})<{ role: 'user' | 'assistant' }>(({ theme, role }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    '& .message-content': {
        maxWidth: '70%',
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: role === 'user' ? theme.palette.primary.main : theme.palette.grey[100],
        color: role === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
    },
    '& .message-avatar': {
        margin: theme.spacing(0, 1),
        width: 32,
        height: 32,
    },
}));

const FloatingChatButton = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    right: 16,
    bottom: 100,
    zIndex: 999,
    [theme.breakpoints.down('sm')]: {
        bottom: 80, // Leave space for bottom navigation
    },
}));

const AIChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiSource, setAiSource] = useState<AISource>('online');
    const [aiStatus, setAiStatus] = useState<{
        local: { available: boolean; modelName?: string; webGPUSupported: boolean };
        online: { available: boolean; authenticated: boolean };
    } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load AI source preference from localStorage
    useEffect(() => {
        const savedSource = localStorage.getItem('ai-chat-source') as AISource;
        if (savedSource && (savedSource === 'local' || savedSource === 'online')) {
            setAiSource(savedSource);
            chatAIServiceAdapter.setSource(savedSource);
        }
    }, []);

    // Check AI status when component mounts or AI source changes
    useEffect(() => {
        checkAIStatus();
    }, [aiSource]);

    const checkAIStatus = async () => {
        try {
            const status = await chatAIServiceAdapter.getStatus();
            setAiStatus(status);
        } catch (error) {
            console.error('Error checking AI status:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        setError(null);
    };

    const handleAISourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSource = event.target.value as AISource;
        setAiSource(newSource);
        chatAIServiceAdapter.setSource(newSource);
        localStorage.setItem('ai-chat-source', newSource);
        checkAIStatus(); // Re-check status when source changes
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            // Create context from conversation history
            const conversationContext = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add the current user message to context
            conversationContext.push({
                role: 'user',
                content: inputValue
            });

            // Call the AI service adapter
            const contextJson = JSON.stringify(conversationContext);
            const response: AIResponse = await chatAIServiceAdapter.sendChatMessage(inputValue, contextJson);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response.response,
                role: 'assistant',
                timestamp: new Date(),
                source: response.source,
                modelName: response.modelName,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Add error message to chat
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const getSourceIcon = (source: AISource) => {
        return source === 'local' ? <ComputerIcon fontSize="small" /> : <CloudIcon fontSize="small" />;
    };

    const getSourceColor = (source: AISource) => {
        return source === 'local' ? 'success' : 'primary';
    };

    return (
        <>
            {!isOpen && (
                <FloatingChatButton
                    onClick={handleToggleChat}
                    aria-label="Open AI Chat"
                >
                    <ChatIcon />
                </FloatingChatButton>
            )}

            <Collapse in={isOpen} unmountOnExit>
                <StyledCard>
                    <CardHeader
                        title={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <BotIcon color="primary" />
                                <Typography variant="h6">AI Assistant</Typography>
                            </Stack>
                        }
                        action={
                            <IconButton onClick={handleToggleChat} size="small">
                                <CloseIcon />
                            </IconButton>
                        }
                        sx={{ pb: 1 }}
                    />

                    <CardContent sx={{ pt: 0 }}>
                        {/* AI Source Selection */}
                        <Box sx={{ mb: 2 }}>
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
                                                {aiStatus?.online.available ? (
                                                    <WifiIcon fontSize="small" color="success" />
                                                ) : (
                                                    <WifiOffIcon fontSize="small" color="error" />
                                                )}
                                            </Stack>
                                        }
                                        disabled={!aiStatus?.online.available}
                                    />
                                    <FormControlLabel
                                        value="local"
                                        control={<Radio size="small" />}
                                        label={
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <ComputerIcon fontSize="small" />
                                                <Typography variant="body2">Local</Typography>
                                                {aiStatus?.local.available ? (
                                                    <Chip 
                                                        label={aiStatus.local.modelName || 'Ready'} 
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
                                        disabled={!aiStatus?.local.available}
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Box>

                        {/* Status Alerts */}
                        {aiSource === 'local' && aiStatus && !aiStatus.local.available && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <AlertTitle>Local AI Not Available</AlertTitle>
                                {!aiStatus.local.webGPUSupported 
                                    ? 'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.'
                                    : 'No local model is ready. Please download a model from settings.'
                                }
                            </Alert>
                        )}

                        {aiSource === 'online' && aiStatus && !aiStatus.online.available && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <AlertTitle>Online AI Not Available</AlertTitle>
                                {!aiStatus.online.authenticated 
                                    ? 'Please log in to use online AI.'
                                    : 'No internet connection. Please check your network.'
                                }
                            </Alert>
                        )}

                        <ChatContainer>
                            {messages.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <BotIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Hello! I'm here to help with your inspections.
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Using {aiSource === 'local' ? 'local AI' : 'online AI'}
                                    </Typography>
                                </Box>
                            )}

                            {messages.map((message) => (
                                <MessageBubble key={message.id} role={message.role}>
                                    {message.role === 'user' ? (
                                        <>
                                            <Box className="message-content">
                                                <Typography variant="body2">{message.content}</Typography>
                                            </Box>
                                            <Avatar className="message-avatar" sx={{ bgcolor: 'primary.main' }}>
                                                <PersonIcon />
                                            </Avatar>
                                        </>
                                    ) : (
                                        <>
                                            <Avatar className="message-avatar" sx={{ bgcolor: 'primary.main' }}>
                                                <BotIcon />
                                            </Avatar>
                                            <Box className="message-content">
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {message.content}
                                                </Typography>
                                                {message.source && (
                                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                                                        {getSourceIcon(message.source)}
                                                        <Typography variant="caption" color="text.secondary">
                                                            {message.modelName || (message.source === 'local' ? 'Local AI' : 'Online AI')}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Box>
                                        </>
                                    )}
                                </MessageBubble>
                            ))}

                            {isLoading && (
                                <MessageBubble role="assistant">
                                    <Avatar className="message-avatar" sx={{ bgcolor: 'primary.main' }}>
                                        <BotIcon />
                                    </Avatar>
                                    <Box className="message-content">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CircularProgress size={20} />
                                            <Typography variant="body2" color="text.secondary">
                                                Thinking...
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </MessageBubble>
                            )}

                            <div ref={messagesEndRef} />
                        </ChatContainer>

                        {error && (
                            <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                                {error}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                ref={inputRef}
                                fullWidth
                                size="small"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading || (aiSource === 'local' && !aiStatus?.local.available) || (aiSource === 'online' && !aiStatus?.online.available)}
                                multiline
                                maxRows={3}
                            />
                            <IconButton
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading || (aiSource === 'local' && !aiStatus?.local.available) || (aiSource === 'online' && !aiStatus?.online.available)}
                                color="primary"
                            >
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </CardContent>
                </StyledCard>
            </Collapse>
        </>
    );
};

export default AIChatBot;