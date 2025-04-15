import React from 'react';
import SegmentIcon from '@mui/icons-material/Segment';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import PanToolIcon from '@mui/icons-material/PanTool';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import CloseIcon from '@mui/icons-material/Close';
import { Divider, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from "./style.module.scss";

interface ViewerMenuProps {
    isOrbitSelected: boolean;
    isPanSelected: boolean;
    isMeasurementMode: boolean;
    isClipperOn: boolean;
    showRatings?: boolean;
    onClipperClick: () => void;
    onMeasurementClick: () => void;
    onFitScreenClick: () => void;
    onOrbitCameraClick: () => void;
    onPanCameraClick: () => void;
    onToggleRatings?: () => void;
    removeAllLineMeasurement: () => void;
    removeClipper: () => void;
    showstructureDetail: () => void;
    showConditionPanelHandler: () => void;
}

const ViewerMenu: React.FC<ViewerMenuProps> = ({
    isOrbitSelected,
    isPanSelected,
    isMeasurementMode,
    isClipperOn,
    showRatings = true,
    onClipperClick,
    onMeasurementClick,
    onFitScreenClick,
    onOrbitCameraClick,
    onPanCameraClick,
    onToggleRatings,
    removeAllLineMeasurement,
    removeClipper,
    showstructureDetail,
    showConditionPanelHandler
}) => {
    return (
        <Paper elevation={3} className={styles.viewerMenuContainer}>
            <Stack direction={"row"} spacing={1}>
                <IconButton color="secondary" aria-label="show structure details" onClick={showstructureDetail}>
                    <SegmentIcon />
                </IconButton>

                <Divider orientation="vertical" variant="middle" flexItem />

                <Stack direction={"row"} spacing={1}>
                    <IconButton color="info" aria-label="fit screen" onClick={onFitScreenClick}>
                        <FitScreenIcon />
                    </IconButton>

                    <IconButton color={(isOrbitSelected ? 'default' : 'primary')} aria-label="use camera rotate" onClick={onOrbitCameraClick}>
                        <ThreeSixtyIcon />
                    </IconButton>

                    <IconButton color={(isPanSelected ? 'default' : 'secondary')} aria-label="use camera pan" onClick={onPanCameraClick}>
                        <PanToolIcon />
                    </IconButton>
                </Stack>

                <Divider orientation="vertical" variant="middle" flexItem />

                <Stack direction='row' spacing={1}>
                    <IconButton color={isMeasurementMode ? 'default' : 'info'} aria-label="use ruler" onClick={onMeasurementClick}>
                        {isMeasurementMode ?
                            <CloseIcon />
                            :
                            <DesignServicesIcon />
                        }
                    </IconButton>
                    {isMeasurementMode &&
                        <IconButton color='error' aria-label="delete ruler" onClick={removeAllLineMeasurement}>
                            <DeleteForeverIcon />
                        </IconButton>
                    }
                </Stack>

                <Divider orientation="vertical" variant="middle" flexItem />

                <Stack direction='row' spacing={2}>
                    <IconButton color={isClipperOn ? 'default' : 'warning'} aria-label="use clipper" onClick={onClipperClick}>
                        {isClipperOn ?
                            <CloseIcon />
                            :
                            <CarpenterIcon />
                        }
                    </IconButton>
                    {isClipperOn &&
                        <IconButton color='error' aria-label="delete clipper" onClick={removeClipper}>
                            <DeleteForeverIcon />
                        </IconButton>
                    }
                </Stack>

                <Divider orientation="vertical" variant="middle" flexItem />

                {onToggleRatings && (
                    <Tooltip title={showRatings ? "Hide ratings" : "Show ratings"}>
                        <IconButton
                            color={showRatings ? "success" : "default"}
                            aria-label="toggle ratings visibility"
                            onClick={onToggleRatings}
                        >
                            {showRatings ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                    </Tooltip>
                )}

                <IconButton color="secondary" aria-label="show condition panel" onClick={showConditionPanelHandler}>
                    <TroubleshootIcon />
                </IconButton>
            </Stack>
        </Paper>
    );
};

export default ViewerMenu;