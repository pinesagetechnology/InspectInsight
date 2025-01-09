import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from "../store/SystemAvailability/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { isOnlineSelector } from '../store/SystemAvailability/selectors';

export const useOfflineSync = () => {
    const dispatch = useDispatch();
    const isOnline = useSelector(isOnlineSelector);

    useEffect(() => {
        // Check status periodically
        const interval = setInterval(() => {
            dispatch({ type: actions.SYSTEM_CHECK_STATUS } as PayloadAction);
        }, 30000); // Check every 30 seconds

        // Check status on window focus
        const handleFocus = () => {
            dispatch({ type: actions.SYSTEM_CHECK_STATUS } as PayloadAction);
        };

        // Check status on online/offline events
        const handleOnline = () => {
            dispatch({ type: actions.SYSTEM_CHECK_STATUS });
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', () => {
            dispatch({ type: actions.SYSTEM_SET_STATUS } as PayloadAction);
        });

        // Initial check
        dispatch({ type: actions.SYSTEM_CHECK_STATUS });

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('online', handleOnline);
        };
    }, [dispatch]);

    return isOnline;
};