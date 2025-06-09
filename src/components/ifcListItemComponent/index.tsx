import {
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Paper,
    useTheme,
    TextField,
    InputAdornment,
    Collapse,
    Typography,
    Skeleton,
    Stack,
} from '@mui/material';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisibilityOffIcons, getGroupedElements } from '../../store/IFCViewer/selectors';
import { StructureElement } from '../../entities/structure';
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import * as actions from "../../store/IFCViewer/actions";
import * as commonActions from "../../store/Common/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import classNames from 'classnames';
import styles from './style.module.scss';
import { useDebounce } from '../../hooks/useDebounce';

interface IfcListItemComponentProps {
    handleListItemClick: (item: StructureElement) => void;
    handleFragmentVisibilityChange: (node: StructureElement, isCheck: boolean) => void;
    className?: string;
    selectedElement: StructureElement | null;
}

const IfcListItemComponent: React.FC<IfcListItemComponentProps> = ({
    handleListItemClick,
    handleFragmentVisibilityChange,
    className,
    selectedElement,
}) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const groupedElements: Record<string, StructureElement[]> = useSelector(getGroupedElements);
    const visibilityOffList: string[] = useSelector(getVisibilityOffIcons);
    const [currentSelection, setCurrentSelection] = useState<string>();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLLIElement>(null);

    // Effect to handle selected element changes
    useEffect(() => {
        if (selectedElement?.data?.expressID) {
            const selectionId = selectedElement.data.expressID.toString();
            setCurrentSelection(selectionId);

            // Find the group containing the selected element
            const groupName = Object.entries(groupedElements).find(([_, items]) =>
                items.some(item => item.data.expressID?.toString() === selectionId)
            )?.[0];

            if (groupName) {
                setExpandedGroups(prev => new Set([...prev, groupName]));
                
                // Show loading overlay while scrolling
                dispatch({ type: commonActions.SHOW_LOADING_OVERLAY });

                // Scroll to selected item after a short delay to allow for expansion
                setTimeout(() => {
                    if (selectedItemRef.current) {
                        selectedItemRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });

                        // Hide loading overlay after scroll animation completes
                        setTimeout(() => {
                            dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY });
                        }, 500); // Match the scroll animation duration
                    } else {
                        dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY });
                    }
                }, 100);
            }
        }
    }, [selectedElement, groupedElements, dispatch]);

    // Memoized event handlers
    const onItemClickHandler = useCallback((item: StructureElement) => {
        const selectionIdentifier = item.data.expressID?.toString() || item.data.Entity?.toString();
        if (currentSelection !== selectionIdentifier) {
            setCurrentSelection(selectionIdentifier);
            handleListItemClick(item);
        }
    }, [currentSelection, handleListItemClick]);

    const onVisibilityChangeHandler = useCallback((item: StructureElement) => {
        const nodeId = item.data?.expressID?.toString() || "";
        const isVisible = visibilityOffList.includes(nodeId);

        dispatch({
            type: isVisible ? actions.REMOVE_VISIBILITY_ICON : actions.ADD_VISIBILITY_ICON,
            payload: nodeId,
        } as PayloadAction<string>);

        handleFragmentVisibilityChange(item, isVisible);
    }, [dispatch, handleFragmentVisibilityChange, visibilityOffList]);

    const toggleGroup = useCallback((groupName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    }, []);

    // Use our custom debounce hook
    const debouncedSetSearchQuery = useDebounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    // Filter elements based on search query
    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groupedElements;

        const filtered: Record<string, StructureElement[]> = {};
        Object.entries(groupedElements || {}).forEach(([type, items]) => {
            const filteredItems = items.filter(item =>
                item.data.Name?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                type.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length > 0) {
                filtered[type] = filteredItems;
            }
        });
        return filtered;
    }, [groupedElements, searchQuery]);

    // Loading state
    useEffect(() => {
        if (groupedElements) {
            setIsLoading(false);
        }
    }, [groupedElements]);

    const renderList = () => {
        if (isLoading) {
            return (
                <Stack spacing={2} direction={'column'}>
                    <Skeleton variant="rounded" height={40} />
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                </Stack>
            );
        } else if (!groupedElements) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                        No elements found
                    </Typography>
                </Box>
            );
        } else {
            return (
                <Paper
                    elevation={0}
                    className={classNames(styles.container, className)}
                >
                    <Box sx={{ p: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search elements..."
                            onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box className={styles.listContainer} ref={listContainerRef}>
                        <List sx={{ p: 0 }}>
                            {Object.entries(filteredGroups || {}).map(([groupName, items]) => (
                                <React.Fragment key={groupName}>
                                    <ListItemButton
                                        onClick={() => toggleGroup(groupName)}
                                        sx={{
                                            backgroundColor: theme.palette.action.hover,
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.selected,
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={`${groupName} (${items.length})`}
                                            primaryTypographyProps={{
                                                variant: 'subtitle2',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        {expandedGroups.has(groupName) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItemButton>
                                    <Collapse in={expandedGroups.has(groupName)}>
                                        {items.map((item) => {
                                            const labelId = `checkbox-list-label-${item}`;
                                            const isHidden = visibilityOffList.includes(item.data.expressID?.toString() || "");
                                            const isSelected = selectedElement?.data?.expressID?.toString() === item.data.expressID?.toString();

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
                                                    component="li"
                                                    ref={isSelected ? selectedItemRef : undefined}
                                                >
                                                    <ListItemButton
                                                        role={undefined}
                                                        onClick={() => onItemClickHandler(item)}
                                                        dense
                                                        selected={isSelected}
                                                        className={classNames(styles.listItem, {
                                                            [styles.selected]: isSelected
                                                        })}
                                                        sx={{
                                                            backgroundColor: isSelected ? theme.palette.action.selected : 'inherit',
                                                            '&:hover': {
                                                                backgroundColor: isSelected 
                                                                    ? theme.palette.action.selected 
                                                                    : theme.palette.action.hover
                                                            }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            id={labelId}
                                                            primary={
                                                                item.identityData?.names?.toString() ||
                                                                item.data.Name?.toString()
                                                            }
                                                            secondary={
                                                                item.identityData?.section?.toString() ||
                                                                item.identityData?.structure?.toString() ||
                                                                item.data.Entity?.toString()}
                                                            primaryTypographyProps={{
                                                                noWrap: true,
                                                                variant: 'body2',
                                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                                color: isSelected ? theme.palette.primary.main : 'inherit'
                                                            }}
                                                            secondaryTypographyProps={{
                                                                noWrap: true,
                                                                variant: 'caption',
                                                                color: isSelected ? theme.palette.primary.main : 'inherit'
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            );
                                        })}
                                    </Collapse>
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                </Paper>
            );
        }
    }

    return (
        renderList()
    );
};

export default React.memo(IfcListItemComponent);
