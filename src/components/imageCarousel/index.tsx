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
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ImageCarouselProps {
    open: boolean;
    onClose: () => void;
    images: string[];
}

function getFileNameFromUrl(url: string) {
    try {
        return decodeURIComponent(url.split('/').pop() || url);
    } catch {
        return url;
    }
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ open, onClose, images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!open) setCurrentIndex(0);
    }, [open]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleThumbnailClick = (idx: number) => {
        setCurrentIndex(idx);
    };

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

                {/* Image count */}
                <Box sx={{ color: 'white', textAlign: 'center', pt: 2, fontWeight: 500, fontSize: 22 }}>
                    {images.length > 1 ? `${currentIndex + 1}/${images.length}` : ''}
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
                    {images.length > 1 && (
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
                        src={images[currentIndex]}
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
                {images.length > 1 && (
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, mb: 1 }}>
                        {images.map((img, idx) => (
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
            </DialogContent>
        </Dialog>
    );
};

export default ImageCarousel; 