import React, { useEffect, useState } from 'react';
import { Stack, Checkbox } from '@mui/material';
import { red, green, yellow, orange } from '@mui/material/colors';

interface RatingComponentProps {
    isDisabled: boolean;
    rating: string;
    elementId: number;
    handleOnRatingChange: (value: string, elementId: number) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({
    isDisabled,
    rating,
    elementId,
    handleOnRatingChange
}) => {
    console.log('rating', rating);

    const handleChange = (value: string) => {
        handleOnRatingChange(value, elementId);
    };

    return (
        <Stack direction={'row'} spacing={2}>
            <Checkbox
                disabled={isDisabled}
                checked={rating === '1'}
                aria-label="CS1"
                onChange={() => handleChange('1')}
                sx={{
                    '&.Mui-checked': {
                        color: green[900],
                    },
                }}
            />

            <Checkbox
                disabled={isDisabled}
                checked={rating === '2'}
                aria-label="CS2"
                onChange={() => handleChange('2')}
                sx={{
                    '&.Mui-checked': {
                        color: yellow[600],
                    },
                }}
            />

            <Checkbox
                disabled={isDisabled}
                checked={rating === '3'}
                aria-label="CS3"
                onChange={() => handleChange('3')}
                sx={{
                    '&.Mui-checked': {
                        color: orange[900],
                    },
                }}
            />

            <Checkbox
                disabled={isDisabled}
                aria-label="CS4"
                checked={rating === '4'}
                onChange={() => handleChange('4')}
                sx={{
                    '&.Mui-checked': {
                        color: red[900],
                    },
                }}
            />
        </Stack>
    );
}

export default RatingComponent;
