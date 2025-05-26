import React from 'react';
import { CircularProgress, Box, Typography, Stack } from '@mui/material';

type CircularProgressWithLabelProps = {
    reviewedCount: number;
    totalQuantity: number;
    label?: string;
};

export const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
    reviewedCount,
    totalQuantity,
    label
}) => {
    const percent = totalQuantity > 0 ? Math.round((reviewedCount / totalQuantity) * 100) : 0;

    // Determine color based on percentage
    const getColor = () => {
        if (percent < 30) return 'error';
        if (percent < 70) return 'warning';
        return 'success';
    };

    return (
        <Stack direction="row" spacing={1}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">

                {label && (
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        {label}
                    </Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                    {reviewedCount} / {totalQuantity}
                </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Box position="relative" display="inline-flex">
                    <CircularProgress
                        variant="determinate"
                        value={percent}
                        size={80}
                        color={getColor()}
                        sx={{ transition: 'all 0.3s ease' }}
                    />
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Typography variant="h6" color="textPrimary">
                            {percent}%
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Stack>
    );
};
