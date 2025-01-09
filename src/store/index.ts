import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
import rootReducers from "./rootReducers";
import sagas from "./rootSagas";

const sagaMiddleware = createSagaMiddleware();
const isDevMode = process.env.NODE_ENV === "development";

const store = configureStore({
    reducer: rootReducers,
    devTools: isDevMode,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware)
});

sagaMiddleware.run(sagas);

export default store;
