import React, { useEffect, useState, useCallback } from 'react';
import {
    TextField,
    styled,
    Grid2 as Grid,
} from '@mui/material';
import { validateConditionRating } from '../../helper/util';
import { useDebounce } from '../../customHook/debounce';

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
    totalQty: number;
    otherValues: number[];
    disabled?: boolean;
}> = React.memo(({ value, onChange, index, totalQty, otherValues, disabled }) => {
    const [localValue, setLocalValue] = useState(value);
    const [hasError, setHasError] = useState(false);
    const debouncedValue = useDebounce(localValue, 500); // 500ms delay

    // Sync local value with prop value when it changes from outside
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Handle debounced value changes
    useEffect(() => {
        if (debouncedValue === value) return; // Skip if value hasn't changed

        // Create condition array for validation
        const currentCondition = [...otherValues];
        currentCondition[index] = debouncedValue;

        const isValid = validateConditionRating(
            currentCondition,
            index,
            debouncedValue,
            parseInt(totalQty.toString(), 10)
        );

        setHasError(!isValid);

        if (isValid) {
            onChange(debouncedValue);
        }
    }, [debouncedValue, onChange, index, totalQty, otherValues, value]);

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

        setLocalValue(num);
    }, []);

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