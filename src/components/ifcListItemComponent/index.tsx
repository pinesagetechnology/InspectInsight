import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, Box, Paper, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisibilityOffIcons } from '../../store/IFCViewer/selectors';
import { StructureElement } from '../../entities/structure';
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getFlattenStructureElement } from '../../store/IFCViewer/selectors';
import * as actions from "../../store/IFCViewer/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import classNames from 'classnames';
import styles from './style.module.scss';

interface IfcListItemComponentProps {
    handleTreeItemClick: (item: StructureElement) => void;
    handleFragmentVisibilityChange: (node: StructureElement, isCheck: boolean) => void;
    className?: string;
}

const IfcListItemComponent: React.FC<IfcListItemComponentProps> = ({
    handleTreeItemClick,
    handleFragmentVisibilityChange,
    className,
}) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const flattenStructureElement: StructureElement[] = useSelector(getFlattenStructureElement);
    const visibilityOffList: string[] = useSelector(getVisibilityOffIcons);
    const [currentSelection, setCurrentSelection] = useState<string>();

    const onItemClickHandler = (item: StructureElement) => {
        const selectionIdentifier = item.data.expressID?.toString() || item.data.Entity?.toString();
        if (currentSelection !== selectionIdentifier) {
            setCurrentSelection(selectionIdentifier);
            handleTreeItemClick(item);
        }
    }

    const onVisibilityChangeHandler = (item: StructureElement) => {
        const nodeId = item.data?.expressID?.toString() || "";
        const isVisible = visibilityOffList.includes(nodeId);

        if (isVisible) {
            dispatch({
                type: actions.REMOVE_VISIBILITY_ICON,
                payload: nodeId,
            } as PayloadAction<string>);
        } else {
            dispatch({
                type: actions.ADD_VISIBILITY_ICON,
                payload: nodeId,
            } as PayloadAction<string>);
        }

        handleFragmentVisibilityChange(item, isVisible);
    }

    return (
        <Paper 
            elevation={0} 
            className={classNames(styles.container, className)}
        >
            
            <Box className={styles.listContainer}>
                <List sx={{ p: 0 }}>
                    {flattenStructureElement?.map((item) => {
                        const labelId = `checkbox-list-label-${item}`;
                        const isHidden = visibilityOffList.includes(item.data.expressID?.toString() || "");

                        return (
                            <ListItem
                                key={`${item.data.expressID}-${item.data.Name}`}
                                secondaryAction={
                                    <IconButton 
                                        edge="end" 
                                        aria-label="visibility"
                                        onClick={() => onVisibilityChangeHandler(item)}
                                        size="small"
                                        className={styles.visibilityButton}
                                    >
                                        {isHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                }
                                disablePadding
                                divider
                            >
                                <ListItemButton 
                                    role={undefined} 
                                    onClick={() => onItemClickHandler(item)} 
                                    dense
                                    selected={currentSelection === (item.data.expressID?.toString() || item.data.Entity?.toString())}
                                    className={classNames(styles.listItem, {
                                        [styles.selected]: currentSelection === (item.data.expressID?.toString() || item.data.Entity?.toString())
                                    })}
                                >
                                    <ListItemText 
                                        id={labelId}
                                        primary={item.data.Entity?.toString()}
                                        secondary={item.data.Name?.toString()}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            variant: 'body2',
                                        }}
                                        secondaryTypographyProps={{
                                            noWrap: true,
                                            variant: 'caption',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Paper>
    );
};

export default IfcListItemComponent;
