import React, { ReactNode } from 'react'
import PageFooter from '../pageFooter';
import PageHeader from '../pageHeader';
import styles from "./style.module.scss";

interface FormPageWrapperProps {
    children: ReactNode;
}

const FormWrapper: React.FunctionComponent<FormPageWrapperProps> = ({ children }) => {
    return (
        <React.Fragment>
            <div className={styles.pageContent}>
                <PageHeader />
                {children}
            </div>
            <PageFooter />
        </React.Fragment>
    )
}

export default FormWrapper;