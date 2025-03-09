import React, { useCallback, useState } from "react";
// import { TableGroupData } from "@thatopen/ui";
import { IconButton, InputBase, Paper, Stack, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from "./style.module.scss";
import { StructureElement } from "../../entities/structure";

interface TreeViewComponentProps {
  treeData: StructureElement[];
  handleClick: (item: StructureElement) => void;
  handleFragmentVisibilityChange: (node: StructureElement, isCheck: boolean) => void;
}

const TreeViewComponent: React.FC<TreeViewComponentProps> = ({
  treeData,
  handleClick,
  handleFragmentVisibilityChange
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currntSelection, setCurrentSelection] = useState<string>();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [visiblityOffList, setVisiblityOffList] = useState<string[]>([]);

  const filterTree = (nodes: StructureElement[], query: string): StructureElement[] => {
    return nodes
      .map((node) => {
        const children = filterTree(node.children || [], query);
        const isMatch = node?.data?.Entity?.toString().toLowerCase().includes(query.toLowerCase()) ||
          node?.data?.Name?.toString().toLowerCase().includes(query.toLowerCase());

        if (isMatch || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter((node) => node !== null) as StructureElement[];
  };

  const filteredTreeData = searchQuery ? filterTree(treeData, searchQuery) : treeData;

  const onVisibilityChangeHandler = (node: StructureElement) => {
    const found = visiblityOffList.find(x => x === node.data.expressID?.toString());
    const isVisible = (found) ? true : false;

    if (found) {
      setVisiblityOffList(prev => {
        return prev.filter(x => x !== found)
      })
    } else {
      setVisiblityOffList(prev => {
        return [...prev, node.data.expressID?.toString()!];
      })
    }

    handleFragmentVisibilityChange(node, isVisible);
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) =>
      prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]
    );
  }

  const onItemClickhandler = (node: StructureElement) => {
    const selectionIdentifier = node.data.expressID?.toString() || node.data.Entity?.toString();

    if (currntSelection !== selectionIdentifier) {
      setCurrentSelection(selectionIdentifier);

      if (node.children?.length === 0) {
        handleClick(node);
      }
    }
  }

  const showVisibleIcon = useCallback((node: StructureElement): React.ReactNode => {
    const found = visiblityOffList?.find(x => x === node.data.expressID?.toString());
    if (found)
      return (< IconButton color="error" onClick={() => onVisibilityChangeHandler(node)}>
        <VisibilityOffIcon />
      </IconButton >)
    else {
      return (< IconButton color="success" onClick={() => onVisibilityChangeHandler(node)}>
        <VisibilityIcon />
      </IconButton >)
    }
  }, [visiblityOffList])

  const renderTree = (nodes: StructureElement) => {
    const nodeId = nodes.data.expressID?.toString() || `${nodes.data.Entity?.toString()}`;
    const isExpanded = expandedNodes.includes(nodeId);
    const hasChildren = !!nodes.children && nodes.children.length > 0;

    return (
      <div id="treeItemContainer"
        className={styles.treeItemContainer}
        key={nodeId}>
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
          {
            !hasChildren && (
              showVisibleIcon(nodes)
            )
          }
          <span onClick={() => onItemClickhandler(nodes)}>
            <Stack direction={"column"}>
              <Typography variant="subtitle2" gutterBottom>
                {nodes?.data?.Entity?.toString()}
              </Typography>
              <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                {nodes?.data?.Name?.toString()}
              </Typography>
            </Stack>
          </span>
        </div>

        {isExpanded &&
          hasChildren &&
          nodes.children?.map((child) => renderTree(child))}
      </div>
    );
  }

  return (
    <React.Fragment>
      <div>
        <Paper
          component="form"
          className={styles.searchContainer}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>

      <div className={styles.treeItemsContainer}>
        {filteredTreeData.map((node) => renderTree(node))}
      </div>

    </React.Fragment>
  );
};

export default TreeViewComponent;