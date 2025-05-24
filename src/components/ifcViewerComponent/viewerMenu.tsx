import React from 'react';
import SegmentIcon from '@mui/icons-material/Segment';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import PanToolIcon from '@mui/icons-material/PanTool';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import CloseIcon from '@mui/icons-material/Close';
import { Divider, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import styles from "./style.module.scss";

interface ViewerMenuProps {
    isOrbitSelected: boolean;
    isPanSelected: boolean;
    isMeasurementMode: boolean;
    isClipperOn: boolean;
    onClipperClick: () => void;
    onMeasurementClick: () => void;
    onFitScreenClick: () => void;
    onOrbitCameraClick: () => void;
    onPanCameraClick: () => void;
    removeAllLineMeasurement: () => void;
    removeClipper: () => void;
}

const ViewerMenu: React.FC<ViewerMenuProps> = ({
    isOrbitSelected,
    isPanSelected,
    isMeasurementMode,
    isClipperOn,
    onClipperClick,
    onMeasurementClick,
    onFitScreenClick,
    onOrbitCameraClick,
    onPanCameraClick,
    removeAllLineMeasurement,
    removeClipper,
}) => {
    return (
        <Paper elevation={3} className={styles.viewerMenuContainer}>
            <Stack direction={"row"} spacing={1}>
                <Stack direction={"row"} spacing={1}>
                    <IconButton color="info" aria-label="fit screen" onClick={onFitScreenClick} className={styles.menuButtonSize}>
                        <FitScreenIcon />
                    </IconButton>

                    <IconButton color={(isOrbitSelected ? 'default' : 'primary')} aria-label="use camera rotate" onClick={onOrbitCameraClick} className={styles.menuButtonSize}>
                        <ThreeSixtyIcon />
                    </IconButton>

                    <IconButton color={(isPanSelected ? 'default' : 'secondary')} aria-label="use camera pan" onClick={onPanCameraClick} className={styles.menuButtonSize}>
                        <PanToolIcon />
                    </IconButton>
                </Stack>

                <Divider orientation="vertical" variant="middle" flexItem />

                <Stack direction='row' spacing={1}>
                    <IconButton color={isMeasurementMode ? 'default' : 'info'} aria-label="use ruler" onClick={onMeasurementClick} className={styles.menuButtonSize}>
                        {isMeasurementMode ?
                            <CloseIcon />
                            :
                            <DesignServicesIcon />
                        }
                    </IconButton>
                    {isMeasurementMode &&
                        <IconButton color='error' aria-label="delete ruler" onClick={removeAllLineMeasurement} className={styles.menuButtonSize}>
                            <DeleteForeverIcon />
                        </IconButton>
                    }
                </Stack>
            </Stack>
        </Paper>
    );
};

export default ViewerMenu;