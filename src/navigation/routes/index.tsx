import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RoutesValueEnum } from "../../enums";
import ProtectedRoute from "../../components/auth/protectedRoute";

const HomePage = React.lazy(() => import('../../pages/homePage/index'));
const LoginPage = React.lazy(() => import('../../pages/loginPage/index'));
const InspectionDetailPage = React.lazy(() => import('../../pages/inspectionDetails/index'));
const ConditionRatingPage = React.lazy(() => import('../../pages/conditionRating/index'));
const InspectionComment = React.lazy(() => import('../../pages/inspectorComments/index'));
const InspectionReview = React.lazy(() => import('../../pages/reviewAndSubmit/index'));
const PreviousInspectionListPage = React.lazy(() => import('../../pages/previousInspectionList/index'));
const PreviousInspectionDetailPage = React.lazy(() => import('../../pages/previousInspection/index'));
const IFCViewer = React.lazy(() => import('../../pages/viewer/index'));

export const AppRouter: React.FunctionComponent = () => {
    return (
        <React.Fragment>
            <Routes>
                {/* Public routes */}
                <Route path="" element={<LoginPage />} />
                <Route path={`${RoutesValueEnum.Login}`} element={<LoginPage />} />

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