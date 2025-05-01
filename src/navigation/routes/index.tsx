// src/navigation/routes/index.tsx - Updated to avoid lazy loading for better offline support
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RoutesValueEnum } from "../../enums";
import ProtectedRoute from "../../components/auth/protectedRoute";

import HomePage from '../../pages/homePage/index';
import LoginPage from '../../pages/loginPage/index';
import InspectionDetailPage from '../../pages/inspectionDetails/index';
import ConditionRatingPage from '../../pages/conditionRating/index';
import InspectionComment from '../../pages/inspectorComments/index';
import InspectionReview from '../../pages/reviewAndSubmit/index';
import PreviousInspectionListPage from '../../pages/previousInspectionList/index';
import PreviousInspectionDetailPage from '../../pages/previousInspection/index';
import IFCViewer from '../../pages/viewer/index';

export const AppRouter: React.FunctionComponent = () => {
    return (
        <React.Fragment>
            <Routes>
                {/* Public routes */}
                <Route path={`${RoutesValueEnum.Login}`} element={<LoginPage />} />
                <Route path={''} element={<LoginPage />} />


                {/* Protected routes */}
                <Route path={`${RoutesValueEnum.Home}`} element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.InspectionDetail}`} element={
                    <ProtectedRoute>
                        <InspectionDetailPage />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.ConditionRating}`} element={
                    <ProtectedRoute>
                        <ConditionRatingPage />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.IFCViewer}`} element={
                    <ProtectedRoute>
                        <IFCViewer />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.InspectorComments}`} element={
                    <ProtectedRoute>
                        <InspectionComment />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.InspectionReview}`} element={
                    <ProtectedRoute>
                        <InspectionReview />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.PreviousInspection}`} element={
                    <ProtectedRoute>
                        <PreviousInspectionListPage />
                    </ProtectedRoute>
                } />
                <Route path={`${RoutesValueEnum.PreviousInspectionDetail}`} element={
                    <ProtectedRoute>
                        <PreviousInspectionDetailPage />
                    </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to={`${RoutesValueEnum.Login}`} replace />} />
            </Routes>
        </React.Fragment>
    )
}