import React, { useState } from 'react';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    FormControl,
    FormControlLabel,
    Switch,
    Slider,
    Select,
    MenuItem,
    Paper,
    Stack,
    Alert,
    AlertTitle,
    IconButton,
} from '@mui/material';

import {
    Settings as SettingsIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Upload as UploadIcon,
    Description as DescriptionIcon,
    Delete as DeleteIcon,
    Cached as CachedIcon,
    ReportProblem as ReportProblemIcon,
} from '@mui/icons-material';
import { AppConfig, ModelConfig, WebLLMProgress } from '../../models/webllm';

// Add CSS keyframes for animations
const spinKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
}

interface SettingsProps {
    handleDialogClose: () => void;
    config: AppConfig;
    setConfig: (config: AppConfig) => void;
    availableModels: ModelConfig[];
    currentModel: string | null;
    isModelReady: boolean;
    webGPUSupported: boolean | null;
    onDownloadModel: (modelId: string, onProgress?: (progress: WebLLMProgress) => void) => Promise<void>;
    onSwitchModel: (modelId: string, onProgress?: (progress: WebLLMProgress) => void) => Promise<void>;
    onGuidelinesUpload: (file: File) => Promise<void>;
    onClearChat?: () => void;
    onDeleteModel: (modelId: string) => Promise<void>;
}

const AppSettingsComponent: React.FC<SettingsProps> = ({
    handleDialogClose,
    config,
    setConfig,
    availableModels,
    currentModel,
    isModelReady,
    webGPUSupported,
    onDownloadModel,
    onSwitchModel,
    onGuidelinesUpload,
    onClearChat,
    onDeleteModel,
}) => {

    const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
    const [switchingModel, setSwitchingModel] = useState<string | null>(null);
    const [uploadingGuidelines, setUploadingGuidelines] = useState(false);
    const [deletingModel, setDeletingModel] = useState<string | null>(null);

    const handleModelDelete = async (modelId: string) => {
        setDeletingModel(modelId);
        try {
            await onDeleteModel(modelId);
        } catch (error) {
            console.error('Model deletion failed:', error);
        } finally {
            setDeletingModel(null);
        }
    };

    const handleModelDownload = async (modelId: string) => {
        if (downloadingModel) return;

        setDownloadingModel(modelId);
        try {
            await onDownloadModel(modelId, (progress) => {
                setDownloadProgress(prev => ({
                    ...prev,
                    [modelId]: progress.progress
                }));
            });
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloadingModel(null);
            setDownloadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[modelId];
                return newProgress;
            });
        }
    };

    const handleModelSwitch = async (modelId: string) => {
        if (switchingModel || currentModel === modelId) return;

        setSwitchingModel(modelId);
        try {
            await onSwitchModel(modelId);
        } catch (error) {
            console.error('Model switch failed:', error);
        } finally {
            setSwitchingModel(null);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingGuidelines(true);
        try {
            await onGuidelinesUpload(file);
        } catch (error) {
            console.error('Guidelines upload failed:', error);
        } finally {
            setUploadingGuidelines(false);
            // Reset input
            event.target.value = '';
        }
    };

    const getWebGPUStatusIcon = () => {
        if (webGPUSupported === null) {
            return <CachedIcon sx={{ color: 'warning.main', animation: 'spin 1s linear infinite' }} />;
        }
        return webGPUSupported ? (
            <CheckCircleIcon color="success" />
        ) : (
            <ErrorIcon color="error" />
        );
    };

    const getWebGPUStatusText = () => {
        if (webGPUSupported === null) return 'Checking...';
        return webGPUSupported ? 'Supported' : 'Not Supported';
    };

    const downloadedModels = availableModels.filter(model => model.isDownloaded);
    const totalDownloadedSize = downloadedModels.reduce((total, model) => {
        const sizeNum = parseFloat(model.size.replace(/[^0-9.]/g, ''));
        return total + sizeNum;
    }, 0);

    return (
        <React.Fragment>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <SettingsIcon color="action" />
                            <Typography variant="h6" component="h2">
                                Settings
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        <Stack spacing={3}>
                            {/* System Status */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InfoIcon />
                                    System Status
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    {/* WebGPU Status */}
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {getWebGPUStatusIcon()}
                                            <Typography variant="body2" fontWeight="medium">
                                                WebGPU
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {getWebGPUStatusText()}
                                            </Typography>
                                        </Stack>
                                    </Paper>

                                    {/* Network Status */}
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {navigator.onLine ? (
                                                <WifiIcon color="success" />
                                            ) : (
                                                <WifiOffIcon color="error" />
                                            )}
                                            <Typography variant="body2" fontWeight="medium">
                                                Network
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {navigator.onLine ? 'Online' : 'Offline'}
                                            </Typography>
                                        </Stack>
                                    </Paper>

                                    {/* Current Model */}
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {isModelReady ? (
                                                <CheckCircleIcon color="success" />
                                            ) : (
                                                <WarningIcon color="warning" />
                                            )}
                                            <Typography variant="body2" fontWeight="medium">
                                                Active Model
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {currentModel ? (
                                                    availableModels.find(m => m.modelId === currentModel)?.displayName || currentModel
                                                ) : (
                                                    'None'
                                                )}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Box>

                            {/* Model Management */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    AI Models
                                </Typography>

                                {/* Model Stats */}
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <AlertTitle>Downloaded Models</AlertTitle>
                                    {downloadedModels.length} of {availableModels.length} models
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        Total size: ~{totalDownloadedSize.toFixed(1)}GB
                                    </Typography>
                                </Alert>

                                {/* Model List */}
                                <Stack spacing={2}>
                                    {availableModels.map(model => (
                                        <Card key={model.modelId} variant="outlined">
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {model.displayName}
                                                            </Typography>
                                                            {currentModel === model.modelId && (
                                                                <Chip label="Active" size="small" color="success" />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {model.size} • {model.modelId}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        {model.isDownloaded ? (
                                                            <>
                                                                <CheckCircleIcon color="success" />
                                                                {currentModel !== model.modelId && (
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => handleModelSwitch(model.modelId)}
                                                                        disabled={switchingModel !== null || !webGPUSupported}
                                                                    >
                                                                        {switchingModel === model.modelId ? 'Switching...' : 'Switch'}
                                                                    </Button>
                                                                )}
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleModelDelete(model.modelId)}
                                                                    disabled={deletingModel !== null || currentModel === model.modelId}
                                                                    title="Delete model"
                                                                >
                                                                    {deletingModel === model.modelId ? (
                                                                        <CachedIcon sx={{ animation: 'spin 1s linear infinite' }} />
                                                                    ) : (
                                                                        <DeleteIcon />
                                                                    )}
                                                                </IconButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<DownloadIcon />}
                                                                    onClick={() => handleModelDownload(model.modelId)}
                                                                    disabled={downloadingModel !== null || !webGPUSupported}
                                                                >
                                                                    {downloadingModel === model.modelId ? 'Downloading...' : 'Download'}
                                                                </Button>
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleModelDelete(model.modelId)}
                                                                    disabled={deletingModel !== null}
                                                                    title="Delete model"
                                                                >
                                                                    {deletingModel === model.modelId ? (
                                                                        <CachedIcon sx={{ animation: 'spin 1s linear infinite' }} />
                                                                    ) : (
                                                                        <DeleteIcon />
                                                                    )}
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </Box>

                                                {/* Download Progress */}
                                                {downloadProgress[model.modelId] !== undefined && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Downloading...
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.round(downloadProgress[model.modelId])}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={downloadProgress[model.modelId]}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </Box>
                                                )}

                                                {/* Switch Progress */}
                                                {switchingModel === model.modelId && (
                                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CachedIcon sx={{ animation: 'spin 1s linear infinite' }} color="primary" />
                                                        <Typography variant="caption" color="primary">
                                                            Switching to this model...
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Delete Progress */}
                                                {deletingModel === model.modelId && (
                                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CachedIcon sx={{ animation: 'spin 1s linear infinite' }} color="error" />
                                                        <Typography variant="caption" color="error">
                                                            Deleting model...
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Guidelines */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Guidelines Document
                                </Typography>

                                <Stack spacing={2}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                backgroundColor: 'action.hover',
                                            },
                                            opacity: uploadingGuidelines ? 0.5 : 1,
                                        }}
                                        onClick={() => document.getElementById('guidelines-upload')?.click()}
                                    >
                                        <input
                                            type="file"
                                            accept=".txt,.md"
                                            onChange={handleFileUpload}
                                            disabled={uploadingGuidelines}
                                            style={{ display: 'none' }}
                                            id="guidelines-upload"
                                        />
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                            <UploadIcon color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {uploadingGuidelines ? 'Uploading...' : 'Upload .txt or .md file'}
                                            </Typography>
                                        </Stack>
                                    </Paper>

                                    {config.guidelines.content && (
                                        <Alert severity="success">
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <DescriptionIcon />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {config.guidelines.fileName || 'Guidelines Document'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {config.guidelines.content.length} characters
                                                        {config.guidelines.uploadedAt && (
                                                            <> • Uploaded {config.guidelines.uploadedAt.toLocaleDateString()}</>
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Alert>
                                    )}
                                </Stack>
                            </Box>

                            {/* Advanced Settings */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Advanced Settings
                                </Typography>

                                <Stack spacing={3}>
                                    {/* Temperature */}
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                            Temperature: {config.settings.temperature}
                                        </Typography>
                                        <Slider
                                            value={config.settings.temperature}
                                            onChange={(_, value) => setConfig({
                                                ...config,
                                                settings: {
                                                    ...config.settings,
                                                    temperature: value as number
                                                }
                                            })}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            marks={[
                                                { value: 0, label: 'Focused' },
                                                { value: 1, label: 'Creative' }
                                            ]}
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>

                                    {/* Max Tokens */}
                                    <FormControl fullWidth>
                                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                            Max Response Length
                                        </Typography>
                                        <Select
                                            value={config.settings.maxTokens}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                settings: {
                                                    ...config.settings,
                                                    maxTokens: e.target.value as number
                                                }
                                            })}
                                            size="small"
                                        >
                                            <MenuItem value={256}>Short (256 tokens)</MenuItem>
                                            <MenuItem value={512}>Medium (512 tokens)</MenuItem>
                                            <MenuItem value={1024}>Long (1024 tokens)</MenuItem>
                                            <MenuItem value={2048}>Very Long (2048 tokens)</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {/* Auto Save */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.settings.autoSave}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    settings: {
                                                        ...config.settings,
                                                        autoSave: e.target.checked
                                                    }
                                                })}
                                            />
                                        }
                                        label="Auto-save Conversations"
                                    />
                                </Stack>
                            </Box>

                            {/* Actions */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Actions
                                </Typography>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={onClearChat || (() => { })}
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Clear Chat History
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} autoFocus>
                    Close
                </Button>
            </DialogActions>
        </React.Fragment>
    );
};

export default AppSettingsComponent;
