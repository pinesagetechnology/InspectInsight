import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    styled,
    Box,
    CircularProgress,
    Stack,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Typography,
    Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { DeleteImagePayload, MaintenanceImageFile, MaintenanceActionModel } from '../../models/inspectionModel';
import { green } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import { getIsUploadingFlag } from '../../store/MaintenanceAction/selectors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/MaintenanceAction/actions";
import { deleteImage, saveCapturedImage } from '../../helper/db';
import { getImageDescriptionFromAI } from '../../helper/genAPI';
import { BridgeInspectionResponse } from '../../entities/genAIModel';

interface ImageUploadProps {
    formData: MaintenanceActionModel;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const CameraPreviewContainer = styled(Box)({
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    overflow: 'hidden',
    '& video': {
        width: '100%',
        height: 'auto',
    },
    '& canvas': {
        display: 'none',
    }
});

const ImageUpload: React.FC<ImageUploadProps> = ({
    formData
}) => {
    const dispatch = useDispatch();
    const uploadFlag = useSelector(getIsUploadingFlag);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraSupport, setHasCameraSupport] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [images, setImages] = useState<MaintenanceImageFile[]>([]);
    const [aiApiResponse, setAiApiResponse] = useState<string | null>(null);
    const [aiApiResponseLoading, setAiApiResponseLoading] = useState(false);

    useEffect(() => {
        setImages(formData.photos || []);
    }, [formData.photos]);

    useEffect(() => {
        // Request persistent camera permissions
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'camera' as PermissionName })
                .then(permissionStatus => {
                    console.log('Camera permission state:', permissionStatus.state);

                    // Listen for changes to permission
                    permissionStatus.onchange = () => {
                        console.log('Camera permission state changed to:', permissionStatus.state);
                        // Update state if needed based on permission changes
                        setHasCameraSupport(permissionStatus.state !== 'denied');
                    };
                })
                .catch(err => console.error('Permission API error:', err));
        }
    }, []);

    const readFileAsBlob = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    // Convert the result to a Blob
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const blob = new Blob([arrayBuffer], { type: file.type });
                    resolve(blob);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newImages: MaintenanceImageFile[] = [];
            for (const file of Array.from(event.target.files)) {
                // Read the file as a blob
                const blob = await readFileAsBlob(file);

                // Create a unique filename that preserves the original name
                const fileName = `upload_${Date.now()}_${file.name}`;

                // Create a URL for preview
                const url = URL.createObjectURL(blob);

                // Save to IndexedDB
                const imageId = await saveCapturedImage(
                    formData.id,
                    blob,
                    fileName
                );

                // Add to our images array
                newImages.push({
                    fileName: file.name,
                    url,
                    dbId: imageId
                });
            }

            dispatch({
                type: actions.SAVE_MAINTENANCE_IMAGE,
                payload: { ...formData, photos: [...(images || []), ...newImages] }
            } as PayloadAction<MaintenanceActionModel>);
        }
        // Optionally, clear the selection
        event.target.value = '';
    };

    const handleDelete = (item: MaintenanceImageFile) => {
        deleteImage(item.dbId).then(() => {
            const updatedImages = images?.filter(image => image.dbId !== item.dbId);
            dispatch({
                type: actions.DELETE_MAINTENANCE_IMAGE,
                payload: {
                    id: item.dbId,
                    updatedImageList: updatedImages
                }
            } as PayloadAction<DeleteImagePayload>);
            setImages(updatedImages || []);

            URL.revokeObjectURL(item.url);
        }).catch(err => {
            console.error("Error deleting image:", err);
            // Handle error appropriately in the UI
        })
    };

    const openCamera = async () => {
        try {
            // Check if the browser supports getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setHasCameraSupport(false);
                setCameraError("Your browser doesn't support camera access");
                return;
            }

            // Get access to the camera
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use the back camera for tablets
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            setStream(mediaStream);
            setCameraOpen(true);

            // Connect the stream to the video element when the dialog opens
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 300);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setHasCameraSupport(false);
            setCameraError(err instanceof Error ? err.message : "Unable to access camera");
        }
    };

    const closeCamera = () => {
        // Stop all tracks in the stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraOpen(false);
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                // Get the blob from canvas
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(blob => {
                        if (blob) resolve(blob);
                        else reject(new Error("Failed to create blob"));
                    }, 'image/jpeg', 0.8);
                });

                // Create a timestamped filename
                const fileName = `camera_${new Date().toISOString().replace(/:/g, '-')}.jpg`;

                // Create a URL for preview
                const url = URL.createObjectURL(blob);

                // Save the image to IndexedDB with the maintenance ID
                const imageId = await saveCapturedImage(formData.id, blob, fileName);

                // Create the image object for the UI
                const newImage: MaintenanceImageFile = {
                    fileName,
                    url,
                    dbId: imageId
                };

                // Add to the UI state
                dispatch({
                    type: actions.SAVE_MAINTENANCE_IMAGE,
                    payload: { ...formData, photos: [...(images || []), newImage] }
                } as PayloadAction<MaintenanceActionModel>);

            } catch (error) {
                console.error("Error capturing photo:", error);
                // Handle error appropriately in the UI
            } finally {
                closeCamera();
            }
        }
    };

    const analyzePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                // Get the blob from canvas
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(blob => {
                        if (blob) resolve(blob);
                        else reject(new Error("Failed to create blob"));
                    }, 'image/jpeg', 0.8);
                });

                const fileName = `camera_${new Date().toISOString().replace(/:/g, '-')}.jpg`;

                // 🔽 Create a File object from the blob for FormData
                const file = new File([blob], fileName, { type: 'image/jpeg' });

                setAiApiResponseLoading(true);
                // 🔽 Prepare the form data for the API call
                const response: BridgeInspectionResponse = await getImageDescriptionFromAI(file);

                // ✅ Handle the analysis result
                console.log("API result:", response.response);

                setAiApiResponse(response.response);

                setAiApiResponseLoading(false);

            } catch (error) {
                console.error("Error capturing photo:", error);
                // Handle error appropriately in the UI
            }
        }
    };

    return (
        <div>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={uploadFlag}
                >
                    Upload Image
                    <VisuallyHiddenInput
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PhotoCameraIcon />}
                    onClick={openCamera}
                    disabled={uploadFlag || !hasCameraSupport}
                >
                    Take Photo
                </Button>
            </Stack>

            <Box sx={{ m: 1, position: 'relative' }}>
                <List>
                    {images?.map((image, index) => (
                        <ListItem key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(image)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <img src={image.url} alt={`uploaded-img-${index}`} style={{ width: '100px', marginRight: '10px' }} />
                            <ListItemText primary={image.fileName} />
                        </ListItem>
                    ))}
                </List>
                {uploadFlag && (
                    <CircularProgress
                        size={24}
                        sx={{
                            color: green[500],
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>

            {/* Camera Dialog */}
            <Dialog
                open={cameraOpen}
                onClose={closeCamera}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Take Photo</DialogTitle>
                <DialogContent>
                    {cameraError ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <p>Error: {cameraError}</p>
                        </Box>
                    ) : (
                        <Stack direction="column" spacing={1}>
                            <CameraPreviewContainer>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                />
                                <canvas ref={canvasRef} />
                            </CameraPreviewContainer>
                            <Box sx={{ mt: 2, width: '80%', height: '40%' }}>
                                {aiApiResponseLoading ?
                                    (
                                        <React.Fragment>
                                            <Skeleton />
                                            <Skeleton animation="wave" />
                                            <Skeleton animation={false} />
                                        </React.Fragment>
                                    ) :
                                    (
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            {aiApiResponse ? (
                                                <span>AI Analysis: {aiApiResponse}</span>
                                            ) : (
                                                <span>AI analysis result will be shown here...</span>
                                            )}
                                        </Typography>
                                    )
                                }
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCamera}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={capturePhoto}
                        disabled={!stream}
                    >
                        Capture
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={analyzePhoto}
                        disabled={!stream || aiApiResponseLoading}
                    >
                        AI Analyze
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ImageUpload;