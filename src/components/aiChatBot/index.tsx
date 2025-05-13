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
    useMediaQuery
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { genAIService } from '../../services/genAIService';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface AIChatBotProps {
    onGetCompletion?: (contextJson: string) => Promise<string>;
}

const StyledCard = styled(Card)(({ theme }) => ({
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 350,
    maxHeight: 500,
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
    height: 300,
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

const AIChatBot: React.FC<AIChatBotProps> = ({
    onGetCompletion
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

            // Call the chat API endpoint with conversation context
            const contextJson = JSON.stringify(conversationContext);
            const response = await genAIService.sendChatMessage(inputValue, contextJson);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                role: 'assistant',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');

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
                        <ChatContainer>
                            {messages.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <BotIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Hello! I'm here to help with your inspections.
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
                                        <CircularProgress size={20} />
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
                                disabled={isLoading}
                                multiline
                                maxRows={3}
                            />
                            <IconButton
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
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