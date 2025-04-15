import React, { useState } from "react";
import TreeItem from "./treeItem";
import SearchBar from "./searchBar";
import { StructureElement } from "../../entities/structure";
import styles from "./style.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getVisibilityOffIcons } from "../../store/IFCViewer/selectors";
import * as actions from "../../store/IFCViewer/actions";
import { PayloadAction } from "@reduxjs/toolkit";
import { filterTree } from "../../helper/ifcTreeManager";

interface TreeViewComponentProps {
  treeData: StructureElement[];
  handleTreeItemClick: (item: StructureElement) => void;
  handleFragmentVisibilityChange: (node: StructureElement, isCheck: boolean) => void;
}

const TreeViewComponent: React.FC<TreeViewComponentProps> = ({
  treeData,
  handleTreeItemClick,
  handleFragmentVisibilityChange,
}) => {
  const dispatch = useDispatch();
  const visibilityOffList: string[] = useSelector(getVisibilityOffIcons);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentSelection, setCurrentSelection] = useState<string>();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const filteredTreeData = searchQuery ? filterTree(treeData, searchQuery) : treeData;

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) =>
      prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]
    );
  }

  const onItemClickHandler = (node: StructureElement) => {
    const selectionIdentifier = node.data.expressID?.toString() || node.data.Entity?.toString();
    if (currentSelection !== selectionIdentifier) {
      setCurrentSelection(selectionIdentifier);
      if (!node.children || node.children.length === 0) {
        handleTreeItemClick(node);
      }
    }
  }

  const updateTreeItemVisibilityOff = (node: StructureElement): boolean => {
    const nodeId = node.data.expressID?.toString() || "";
    const found = visibilityOffList.includes(nodeId);
    if (found) {
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
    return found;
  }

  const onVisibilityChangeHandler = (node: StructureElement) => {
    const isVisible = updateTreeItemVisibilityOff(node);
    handleFragmentVisibilityChange(node, isVisible);
  }

  const onHideAll = (node: StructureElement) => {
    const isVisible = updateTreeItemVisibilityOff(node);
    updateChildItemVisbilityOffRecusrsivly(node, isVisible);
  }

  const updateChildItemVisbilityOffRecusrsivly = (node: StructureElement, isVisible: boolean) => {
    node.children?.forEach((child) => {
      if (isVisible) {
        dispatch({
          type: actions.REMOVE_VISIBILITY_ICON,
          payload: child.data.expressID?.toString() || "",
        } as PayloadAction<string>);
      } else {
        dispatch({
          type: actions.ADD_VISIBILITY_ICON,
          payload: child.data.expressID?.toString() || "",
        } as PayloadAction<string>);
      }

      if (child.children && child.children.length > 0) {
        updateChildItemVisbilityOffRecusrsivly(child, isVisible);
      } else {
        handleFragmentVisibilityChange(child, isVisible);
      }
    });
  }

  return (
    <React.Fragment>
      <div>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>
      <div className={styles.treeItemsContainer}>
        {filteredTreeData.map((node) => (
          <TreeItem
            key={node.data.expressID?.toString() || node.data.Entity?.toString()}
            node={node}
            expandedNodes={expandedNodes}
            toggleExpand={toggleExpand}
            onItemClick={onItemClickHandler}
            onVisibilityChange={onVisibilityChangeHandler}
            onHideAll={onHideAll}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

export default TreeViewComponent;
