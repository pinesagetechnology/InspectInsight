import { useNavigate, useLocation } from "react-router-dom";

export const useNavigationManager = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentPageName = () => {
        return location.pathname.substring(1);
    }

    const goTo = (pageName: string) => {
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
}