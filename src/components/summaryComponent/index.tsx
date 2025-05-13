import React from 'react';
import {
    Typography,
    Box,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    styled
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

interface AISummaryResponse {
    response: string;
}

interface AISummaryDisplayProps {
    summaryData: AISummaryResponse | string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[3],
}));

const SummarySection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const BulletPoint = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
    '&:before': {
        content: '"•"',
        marginRight: theme.spacing(1),
        fontWeight: 'bold',
    },
}));

const AISummaryDisplay: React.FC<AISummaryDisplayProps> = ({ summaryData }) => {
    const parseSummaryResponse = (data: AISummaryResponse | string): string => {
        if (typeof data === 'string') {
            return data;
        }
        return data.response;
    };

    const response = parseSummaryResponse(summaryData);

    // Parse the response into sections
    const parseResponseIntoSections = (text: string) => {
        const sections = text.split(/\d+\.\s*\*\*/).filter(section => section.trim());

        const parsedSections = {
            executiveSummary: '',
            criticalFindings: '',
            componentAnalysis: '',
            complianceStatus: '',
            recommendedActions: ''
        };

        sections.forEach(section => {
            if (section.includes('EXECUTIVE SUMMARY')) {
                parsedSections.executiveSummary = section.replace('EXECUTIVE SUMMARY:**', '').trim();
            } else if (section.includes('CRITICAL FINDINGS')) {
                parsedSections.criticalFindings = section.replace('CRITICAL FINDINGS:**', '').trim();
            } else if (section.includes('COMPONENT ANALYSIS')) {
                parsedSections.componentAnalysis = section.replace('COMPONENT ANALYSIS:**', '').trim();
            } else if (section.includes('COMPLIANCE STATUS')) {
                parsedSections.complianceStatus = section.replace('COMPLIANCE STATUS:**', '').trim();
            } else if (section.includes('RECOMMENDED ACTIONS')) {
                parsedSections.recommendedActions = section.replace('RECOMMENDED ACTIONS:**', '').trim();
            }
        });

        return parsedSections;
    };

    const sections = parseResponseIntoSections(response);

    const renderBulletPoints = (text: string) => {
        const points = text.split(/- /).filter(point => point.trim());
        return points.map((point, index) => (
            <BulletPoint key={index}>
                <Typography variant="body2">{point.trim()}</Typography>
            </BulletPoint>
        ));
    };

    const getComplianceIcon = (status: string) => {
        if (status.toLowerCase().includes('does not meet')) {
            return <ErrorIcon color="error" />;
        } else if (status.toLowerCase().includes('meets all')) {
            return <CheckCircleIcon color="success" />;
        }
        return <WarningIcon color="warning" />;
    };

    const getSeverityChip = (findings: string) => {
        if (findings.toLowerCase().includes('no critical findings')) {
            return <Chip label="No Critical Issues" color="success" size="small" />;
        } else if (findings.toLowerCase().includes('immediate attention')) {
            return <Chip label="Critical Issues Found" color="error" size="small" />;
        }
        return <Chip label="Issues Found" color="warning" size="small" />;
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                AI Inspection Summary
            </Typography>

            <StyledPaper>
                <SummarySection>
                    <SectionHeader>
                        <InfoIcon />
                        Executive Summary
                    </SectionHeader>
                    <Typography variant="body1" paragraph>
                        {sections.executiveSummary}
                    </Typography>
                </SummarySection>

                <Divider />

                <SummarySection>
                    <SectionHeader>
                        <WarningIcon />
                        Critical Findings
                        {getSeverityChip(sections.criticalFindings)}
                    </SectionHeader>
                    <Typography variant="body1" paragraph>
                        {sections.criticalFindings.includes('No critical findings') ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircleIcon color="success" />
                                <Typography>No critical findings identified.</Typography>
                            </Box>
                        ) : (
                            renderBulletPoints(sections.criticalFindings)
                        )}
                    </Typography>
                </SummarySection>
            </StyledPaper>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Component Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body1" paragraph>
                        {sections.componentAnalysis}
                    </Typography>
                    {renderBulletPoints(sections.componentAnalysis)}
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                        {getComplianceIcon(sections.complianceStatus)}
                        Compliance Status
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body1" paragraph>
                        {sections.complianceStatus}
                    </Typography>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Recommended Actions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body1" paragraph>
                        {sections.recommendedActions}
                    </Typography>
                    {renderBulletPoints(sections.recommendedActions)}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default AISummaryDisplay;