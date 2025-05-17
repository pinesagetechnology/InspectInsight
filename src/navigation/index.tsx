import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useNavigationManager = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentPageName = () => {
        return location.pathname.replace(/^\//, '');
    }

    const goTo = (pageName: string) => {
        pageName = pageName.replace(/^\//, '');
        navigate(`/${pageName}`);
    }

    const goBack = () => {
        navigate(-1);
    }

    return {
        getCurrentPageName,
        goTo,
        goBack
    };
};
