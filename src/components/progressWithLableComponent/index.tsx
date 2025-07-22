import React from 'react';
import { LinearProgress, Box, Typography, Stack } from '@mui/material';

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
        <Stack direction="column" spacing={1}>

            <Box display="flex" flexDirection="column" alignItems="center" minWidth={120} width={180}>
                <Typography variant="h6" color="textPrimary" sx={{ mb: 0.5 }}>
                    {percent}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={percent}
                    color={getColor() as any}
                    sx={{ height: 10, borderRadius: 5, width: '100%', transition: 'all 0.3s ease' }}
                />
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" alignContent={'center'}>
                {label && (
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, mr: 1 }}>
                        {label}
                    </Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                    {reviewedCount} / {totalQuantity}
                </Typography>
            </Box>
        </Stack>
    );
};
