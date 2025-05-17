import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormHelperText } from '@mui/material';

interface DatePickerComponentProps {
    name: string;
    label: string;
    controlStyle?: string;
    isoDateValue: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    onDateChange: (name: string, newDate: string) => void;
}

const DatePickerComponent: React.FunctionComponent<DatePickerComponentProps> = ({
    name,
    label,
    controlStyle,
    isoDateValue,
    disabled,
    error,
    helperText,
    onDateChange
}: DatePickerComponentProps) => {
    // Convert ISO string to dayjs object
    const initialDate = (isoDateValue) ? dayjs(isoDateValue) : dayjs();

    // Handler for when user selects a date
    const handleDateChange = (newValue: dayjs.Dayjs | null) => {
        if (newValue) {
            onDateChange(name, newValue.toISOString());
        }
    };

    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    name={name}
                    label={label}
                    value={initialDate}
                    onChange={handleDateChange}
                    className={controlStyle}
                    disabled={disabled}
                    slotProps={{
                        textField: {
                            error: error,
                            fullWidth: true
                        }
                    }}
                />
            </LocalizationProvider>
            {error && helperText && (
                <FormHelperText error>{helperText}</FormHelperText>
            )}
        </div>
    );
}

export default DatePickerComponent;