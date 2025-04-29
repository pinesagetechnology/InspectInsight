import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthData } from '../../models/auth';

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    userId: string | null;
    email: string | null;
}

const initialState = {} as AuthState

const AuthSlice = createSlice({
    name: "AuthState",
    initialState: initialState,
    reducers: {
        setLoginData: (state, action: PayloadAction<AuthData>) => {
            state.email = action.payload.email;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.userId = action.payload.userId;
        },
    },
    // extraReducers: (builder) => {
    //     builder.addCase(resetStateAction, (state) => {
    //     });
    // }
});

export const {
    setLoginData,

} = AuthSlice.actions;

export default AuthSlice.reducer;