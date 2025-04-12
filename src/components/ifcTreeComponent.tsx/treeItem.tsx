import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Stack, IconButton, Typography } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "./style.module.scss";
import { StructureElement } from "../../entities/structure";
import { getVisibilityOffIcons } from "../../store/IFCViewer/selectors";

interface TreeItemProps {
    node: StructureElement;
    expandedNodes: string[];
    currentSelection?: string;
    toggleExpand: (id: string) => void;
    onItemClick: (node: StructureElement) => void;
    onVisibilityChange: (node: StructureElement) => void;
    onHideAll: (node: StructureElement) => void;
}

const TreeItemComponent: React.FC<TreeItemProps> = ({
    node,
    expandedNodes,
    currentSelection,
    toggleExpand,
    onItemClick,
    onVisibilityChange,
    onHideAll,
}) => {
    const nodeId = node.data.expressID?.toString() || node.data.Entity?.toString();
    const isExpanded = expandedNodes.includes(nodeId);
    const hasChildren = node.children && node.children.length > 0;

    const visibilityOffList: string[] = useSelector(getVisibilityOffIcons);
    const renderVisibleIcon = useCallback(() => {
        const isHidden = visibilityOffList.includes(node.data.expressID?.toString() || "");
        return (
            <IconButton onClick={() => onVisibilityChange(node)}>
                {isHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
        );
    }, [node, visibilityOffList, onVisibilityChange]);

    const renderHideAllButton = useCallback(() => {
        const isHidden = visibilityOffList.includes(node.data.expressID?.toString() || "");
        return (
            <IconButton onClick={() => onHideAll(node)}>
                {isHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
        );
    }, [node, visibilityOffList, onHideAll]);

    return (
        <div id="treeItemContainer" className={styles.treeItemContainer} key={nodeId}>
            <Stack direction="row">
                <div
                    id="treeItem"
                    className={styles.treeItem}
                    onClick={() => hasChildren && toggleExpand(nodeId)}
                >
                    {hasChildren ? (
                        <span className={styles.hasChildrenTreeArrow}>
                            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                        </span>
                    ) : (
                        <span className={styles.noChildrenTreeArrow} />
                    )}
                    {!hasChildren && renderVisibleIcon()}
                    <span onClick={() => onItemClick(node)}>
                        <Stack direction="column">
                            <Typography variant="subtitle2" gutterBottom>
                                {node.data.Entity?.toString()}
                            </Typography>
                            <Typography variant="caption" gutterBottom sx={{ display: "block" }}>
                                {node.data.Name?.toString()}
                            </Typography>
                        </Stack>
                    </span>
                </div>

                {hasChildren && renderHideAllButton()}
            </Stack>

            {isExpanded &&
                hasChildren &&
                node.children?.map((child) => (
                    <TreeItemComponent
                        key={child.data.expressID?.toString() || child.data.Entity?.toString()}
                        node={child}
                        expandedNodes={expandedNodes}
                        currentSelection={currentSelection}
                        toggleExpand={toggleExpand}
                        onItemClick={onItemClick}
                        onVisibilityChange={onVisibilityChange}
                        onHideAll={onHideAll}
                    />
                ))}
        </div>
    );
};

export default TreeItemComponent;
