import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RoutesValueEnum } from "../../enums";

const HomePage = React.lazy(() => import('../../pages/homePage/index'));
const InspectionDetailPage = React.lazy(() => import('../../pages/inspectionDetails/index'));
const ConditionRatingPage = React.lazy(() => import('../../pages/conditionRating/index'));
const InspectionComment = React.lazy(() => import('../../pages/inspectorComments/index'));
const InspectionReview = React.lazy(() => import('../../pages/reviewAndSubmit/index'));
const PreviousInspectionListPage = React.lazy(() => import('../../pages/previousInspectionList/index'));
const PreviousInspectionDetailPage = React.lazy(() => import('../../pages/previousInspection/index'));

export const AppRouter: React.FunctionComponent = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route path={`/${RoutesValueEnum.Home}`} element={<HomePage />} />
                <Route path={`/${RoutesValueEnum.InspectionDetail}`} element={<InspectionDetailPage />} />
                <Route path={`/${RoutesValueEnum.ConditionRating}`} element={<ConditionRatingPage />} />
                <Route path={`/${RoutesValueEnum.InspectorComments}`} element={<InspectionComment />} />
                <Route path={`/${RoutesValueEnum.InspectionReview}`} element={<InspectionReview />} />
                <Route path={`/${RoutesValueEnum.PreviousInspection}`} element={<PreviousInspectionListPage />} />
                <Route path={`/${RoutesValueEnum.PreviousInspectionDetail}`} element={<PreviousInspectionDetailPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </React.Fragment>
    )
}