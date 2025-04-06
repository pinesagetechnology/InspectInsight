import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Structure } from '../../entities/structure';
import { resetStateAction } from '../Common/actions';

interface StructureState {
    structures: Structure[];
    currentStructure: Structure;
    isLoading: boolean;
    error: any;
}

const initialState = {
    isLoading: false,
    currentStructure: {} as Structure
} as StructureState

const StructureSlice = createSlice({
    name: "StructureDataState",
    initialState: initialState,
    reducers: {
        setCurrentStructure: (state, action: PayloadAction<Structure>) => {
            state.currentStructure = action.payload;
        },
        setSavedStructures: (state, action: PayloadAction<Structure[]>) => {
            state.structures = action.payload;
        },
        fetchStructuresData: (state) => {
            state.isLoading = true;
            state.error = undefined;
        },
        fetchStructuresDataSuccessful: (state, action: PayloadAction<Structure[]>) => {
            state.structures = action.payload;
            state.isLoading = false;
        },
        structuresDataFailed: (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(resetStateAction, (state) => {
            state.currentStructure = {} as Structure;
        });
    }
});

export const {
    setCurrentStructure,
    setSavedStructures,
    fetchStructuresData,
    fetchStructuresDataSuccessful,
    structuresDataFailed,
} = StructureSlice.actions;

export default StructureSlice.reducer;