import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    useTheme,
    useMediaQuery,
    Typography,
    Stack,
    Paper,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getImageById } from '../../helper/db';
import { downloadImages } from '../../services/assetManagementService';
import { MaintenanceImageFile } from '../../models/inspectionModel';

interface ImageCarouselProps {
    open: boolean;
    onClose: () => void;
    images: MaintenanceImageFile[];
    imageIds?: string[];
    isFromPreviousInspection?: boolean;
}

function getFileNameFromUrl(url: string) {
    try {
        return decodeURIComponent(url.split('/').pop() || url);
    } catch {
        return url;
    }
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    open,
    onClose,
    images,
    imageIds,
    isFromPreviousInspection
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!open) {
            setCurrentIndex(0);
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
            try {
                console.log("images", images);
                if (isFromPreviousInspection && imageIds && imageIds.length > 0) {
                    const fetchedImages = await downloadImages(imageIds);
                    setLoadedImages(fetchedImages);
                } else {
                    // Load images from IndexedDB
                    const populateImagesData = async () => {
                        const imagesData = await Promise.all(
                            images.map(async (image) => {
                                const dbImages = await getImageById(image.dbId);
                                if (dbImages) {
                                    return URL.createObjectURL(dbImages.blob);
                                } else {
                                    return '';
                                }
                            })
                        );
                        const filteredImagesData = imagesData.filter(url => url !== '');

                        setLoadedImages([...filteredImagesData]);
                    }

                    populateImagesData();
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load images');
                console.error('Error loading images:', err);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            loadImages();
        }
    }, [open, images, imageIds, isFromPreviousInspection]);

    // Cleanup URLs when component unmounts or images change
    useEffect(() => {
        console.log("loadedImages", loadedImages);
        return () => {
            loadedImages?.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [loadedImages]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? loadedImages.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === loadedImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleThumbnailClick = (idx: number) => {
        setCurrentIndex(idx);
    };

    if (error) {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        boxShadow: 'none',
                        m: isMobile ? 1 : 2,
                    }
                }}
            >
                <DialogContent sx={{ p: 2, textAlign: 'center', color: 'white' }}>
                    <Typography variant="h6" color="error">
                        Error loading images: {error}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    boxShadow: 'none',
                    m: isMobile ? 1 : 2,
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative', height: '85vh' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        zIndex: 1,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                ) : (
                    <>
                        {/* Image count */}
                        <Box sx={{ color: 'white', textAlign: 'center', pt: 2, fontWeight: 500, fontSize: 22 }}>
                            {loadedImages.length > 1 ? `${currentIndex + 1}/${loadedImages.length}` : ''}
                        </Box>

                        {/* Main image */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '60vh',
                                position: 'relative',
                                mt: 2,
                            }}
                        >
                            {loadedImages.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevious}
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                            zIndex: 2,
                                        }}
                                    >
                                        <ArrowBackIosNewIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={handleNext}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                            zIndex: 2,
                                        }}
                                    >
                                        <ArrowForwardIosIcon />
                                    </IconButton>
                                </>
                            )}

                            <Box
                                component="img"
                                src={loadedImages[currentIndex]}
                                alt={`Image ${currentIndex + 1}`}
                                sx={{
                                    maxWidth: '80%',
                                    maxHeight: '80%',
                                    objectFit: 'contain',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            />
                        </Box>

                        {/* Filename under main image 
        <Box sx={{ color: 'white', textAlign: 'center', mt: 1, mb: 2, fontSize: 18, fontWeight: 400, bgcolor: 'rgba(0,0,0,0.7)', py: 1 }}>
          {getFileNameFromUrl(images[currentIndex])}
        </Box>
*/}
                        {/* Thumbnails */}
                        {loadedImages.length > 1 && (
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, mb: 1 }}>
                                {loadedImages.map((img, idx) => (
                                    <Paper
                                        key={img}
                                        elevation={currentIndex === idx ? 8 : 1}
                                        sx={{
                                            border: currentIndex === idx ? '2px solid #1976d2' : '2px solid transparent',
                                            cursor: 'pointer',
                                            bgcolor: 'transparent',
                                            p: 0.5,
                                            minWidth: 120,
                                            maxWidth: 160,
                                            boxShadow: currentIndex === idx ? 6 : 1,
                                            transition: 'border 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}
                                        onClick={() => handleThumbnailClick(idx)}
                                    >
                                        <Box
                                            component="img"
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            sx={{
                                                width: 120,
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                border: currentIndex === idx ? '2px solid #1976d2' : '1px solid #888',
                                                mb: 0.5,
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'white',
                                                textAlign: 'center',
                                                width: '100%',
                                                bgcolor: 'rgba(0,0,0,0.7)',
                                                borderRadius: 0.5,
                                                px: 0.5,
                                                py: 0.2,
                                                fontSize: 12,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                            title={getFileNameFromUrl(img)}
                                        >
                                            {getFileNameFromUrl(img)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageCarousel; 