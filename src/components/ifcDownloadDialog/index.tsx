import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Box,
    Typography
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { saveIFCFile } from '../../helper/db';

interface IFCDownloadDialogProps {
    open: boolean;
    structureName: string;
    structureId: string;
    ifcPath: string;
    onClose: () => void;
    onDownloadComplete: () => void;
}

const IFCDownloadDialog: React.FC<IFCDownloadDialogProps> = ({
    open,
    structureName,
    structureId,
    ifcPath,
    onClose,
    onDownloadComplete
}) => {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setDownloading(true);
        setError(null);

        try {
            const url = `https://psiassetsapidev.blob.core.windows.net/${ifcPath}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to download IFC file');
            }

            const blob = await response.blob();
            await saveIFCFile(structureId, ifcPath, blob);

            onDownloadComplete();
            onClose();
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download the 3D model. Please try again.');
            setDownloading(false);
        }
    };

    const handleNotNow = () => {
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={downloading ? undefined : onClose}
        >
            <DialogTitle>
                Download 3D Model for Offline Use
            </DialogTitle>
            <DialogContent>
                {downloading ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Downloading 3D model for {structureName}...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <DialogContentText>
                            Would you like to download the 3D model for <strong>{structureName}</strong>?
                            This will allow you to view the model in offline mode.
                        </DialogContentText>
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleNotNow} disabled={downloading}>
                    Not Now
                </Button>
                <Button
                    onClick={handleDownload}
                    startIcon={<CloudDownloadIcon />}
                    variant="contained"
                    disabled={downloading}
                    autoFocus
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IFCDownloadDialog;