import React, { ReactNode } from 'react'
import PageFooter from '../pageFooter';
import PageHeader from '../pageHeader';
import styles from "./style.module.scss";

interface FormPageWrapperProps {
    children: ReactNode;
    isFooterVisible: boolean;
}

const FormWrapper: React.FunctionComponent<FormPageWrapperProps> = ({ children, isFooterVisible }) => {
    return (
        <React.Fragment>
            <div className={styles.pageContent}>
                <PageHeader />
                {children}
            </div>
            {isFooterVisible &&
                <PageFooter />
            }
        </React.Fragment>
    )
}

export default FormWrapper;