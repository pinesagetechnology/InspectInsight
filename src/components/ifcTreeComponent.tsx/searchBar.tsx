import React from "react";
import { Paper, InputBase, IconButton, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./style.module.scss";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchInput = styled(InputBase)({
  flex: 1,
  marginLeft: 8,
  '& input::placeholder': {
    fontSize: '16px'
  },
  width: '30px'
});

const SearchBarComponent: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {

  const onTxtSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <Paper className={styles.searchContainer}>
      <SearchIcon sx={{ color: 'text.secondary' }} />
      <SearchInput
        placeholder="Search here ..."
        fullWidth
        onChange={onTxtSearchInput}
        value={searchQuery}
        id='txtSearchInput'
      />
    </Paper>
  );
};

export default SearchBarComponent;
