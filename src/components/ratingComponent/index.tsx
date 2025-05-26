import React from 'react';
import { Stack, Checkbox, useMediaQuery, Grid2 as Grid, Typography } from '@mui/material';
import { red, green, yellow, orange } from '@mui/material/colors';

interface RatingComponentProps {
    // isDisabled: boolean;
    showLabel?: boolean;
    rating: string;
    elementId: number;
    handleOnRatingChange: (value: string, elementId: number) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({
    // isDisabled,
    showLabel,
    rating,
    elementId,
    handleOnRatingChange
}) => {

    // Add theme and media queries for responsive design
    const isTablet = useMediaQuery('(max-width:900px)');

    const handleChange = (value: string) => {
        handleOnRatingChange(value, elementId);
    };

    return isTablet ? (
        <Grid container>
            <Grid size={6} sx={{ textAlign: 'center' }}>
                {showLabel && <Typography variant="caption" display="block">CS1</Typography>}
                <Checkbox
                    // disabled={isDisabled}
                    checked={rating === '1'}
                    aria-label="CS1"
                    onChange={() => handleChange('1')}
                    sx={{
                        '&.Mui-checked': {
                            color: green[900],
                        },
                    }}
                />
            </Grid>
            <Grid size={6} sx={{ textAlign: 'center' }}>
                {showLabel && <Typography variant="caption" display="block">CS2</Typography>}
                <Checkbox
                    // disabled={isDisabled}
                    checked={rating === '2'}
                    aria-label="CS2"
                    onChange={() => handleChange('2')}
                    sx={{
                        '&.Mui-checked': {
                            color: yellow[600],
                        },
                    }}
                />
            </Grid>
            <Grid size={6} sx={{ textAlign: 'center' }}>
                {showLabel && <Typography variant="caption" display="block">CS3</Typography>}
                <Checkbox
                    // disabled={isDisabled}
                    checked={rating === '3'}
                    aria-label="CS3"
                    onChange={() => handleChange('3')}
                    sx={{
                        '&.Mui-checked': {
                            color: orange[900],
                        },
                    }}
                />
            </Grid>
            <Grid size={6} sx={{ textAlign: 'center' }}>
                {showLabel && <Typography variant="caption" display="block">CS4</Typography>}   
                <Checkbox
                    // disabled={isDisabled}
                    checked={rating === '4'}
                    aria-label="CS4"
                    onChange={() => handleChange('4')}
                    sx={{
                        '&.Mui-checked': {
                            color: red[900],
                        },
                    }}
                />
            </Grid>
        </Grid>
    ) : (
        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            {['CS1', 'CS2', 'CS3', 'CS4'].map((label, idx) => (
                <Stack key={label} alignItems="center" spacing={0.5}>
                    {showLabel && <Typography variant="caption">{label}</Typography>}
                    <Checkbox
                        // disabled={isDisabled}
                        checked={rating === String(idx + 1)}
                        aria-label={label}
                        onChange={() => handleChange(String(idx + 1))}
                        sx={{
                            '&.Mui-checked': {
                                color: [green[900], yellow[600], orange[900], red[900]][idx],
                            },
                        }}
                    />
                </Stack>
            ))}
        </Stack>
    );
}

export default RatingComponent;
