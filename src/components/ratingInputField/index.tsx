import React, { useEffect, useState, useCallback } from 'react';
import {
    TableCell,
    Paper,
    TextField,
    styled,
    Grid2 as Grid,
} from '@mui/material';
import { validateConditionRating } from '../../helper/util';

const RatingInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        width: '50px',
        height: '35px',
        '& input': {
            padding: '4px',
            textAlign: 'center',
        }
    },
    '@media (max-width: 600px)': {
        '& .MuiOutlinedInput-root': {
            width: '40px',
            height: '30px',
        }
    }
}));

// Optimized component for individual rating input
const RatingInputField: React.FC<{
    value: number;
    onChange: (value: number) => void;
    index: number;
    elementCode: string;
    totalQty: number;
    otherValues: number[];
    disabled?: boolean;
}> = React.memo(({ value, onChange, index, elementCode, totalQty, otherValues, disabled }) => {
    const [localValue, setLocalValue] = useState(value);
    const [hasError, setHasError] = useState(false);

    // Sync local value with prop value when it changes from outside
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        // Allow empty string for better UX
        if (inputValue === '') {
            setLocalValue(0);
            setHasError(false);
            return;
        }

        const num = parseInt(inputValue, 10);

        if (isNaN(num) || num < 0) {
            setHasError(true);
            return;
        }

        // Create condition array for validation
        const currentCondition = [...otherValues];
        currentCondition[index] = num;

        const isValid = validateConditionRating(
            currentCondition,
            index,
            num,
            parseInt(totalQty.toString(), 10)
        );

        setHasError(!isValid);
        setLocalValue(num);

        if (isValid) {
            onChange(num);
        }
    }, [onChange, index, totalQty, otherValues]);

    return (
        <RatingInput
            variant="outlined"
            value={localValue}
            onChange={handleChange}
            error={hasError}
            disabled={disabled}
            slotProps={{
                input: {
                    type: 'number',
                    inputProps: { min: 0 },
                }
            }}
        />
    );
});

export default RatingInputField;