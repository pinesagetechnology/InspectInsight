import React, { ChangeEvent, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
    Box,
    Container,
    CssBaseline,
    Fab,
    InputBase,
    Menu,
    MenuItem,
    Paper,
    Stack,
    SwipeableDrawer,
    Typography
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Structure } from '../../entities/structure';
import { FilterModel } from '../../models/map';
import StructureDetailSection from '../../components/mapContainer/structureDetail';
import { useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { DRAWER_BLEEDING } from '../../constants';
import {
    Search as SearchIcon,
    LocationOn,
    Explore
} from '@mui/icons-material';
import styles from './style.module.scss';

const containerStyle = {
    width: '100%',
    height: '80vh',
};

const deafaultCenter = {
    lat: -33.8523,
    lng: 151.2108
};

interface MapComponentProps {
    structures?: Structure[];
    isListView: boolean;
    onSelectStructure: (structure: Structure) => void;
    onFilterLocations: (filter: FilterModel) => void;
    setIsListView: (flag: boolean) => void;
    onStartClickHandler: () => void;
}

const Root = styled('div')(({ theme }) => ({
    height: '100%',
    backgroundColor: grey[100],
    ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.background.default,
    }),
}));

const StyledBox = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.applyStyles('dark', {
        backgroundColor: grey[800],
    }),
}));

const Puller = styled('div')(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: grey[300],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
    ...theme.applyStyles('dark', {
        backgroundColor: grey[900],
    }),
}));

const SearchBar = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: 16,
    right: 150,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: theme.shadows[2],
    padding: '8px 16px',
    width: '30%'
}));

const SearchInput = styled(InputBase)({
    flex: 1,
    marginLeft: 8,
    '& input::placeholder': {
        fontSize: '16px'
    },
    width: '40px'
});

const MapContainer: React.FC<MapComponentProps> = (
    {
        structures,
        isListView,
        onSelectStructure,
        onFilterLocations,
        setIsListView,
        onStartClickHandler
    }) => {

    useEffect(() => {
        setStructureList(structures || []);
    }, [structures]);

    const selectedStructure = useSelector(getCurrentStructure);

    const [map, setMap] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const [structureList, setStructureList] = useState<Structure[]>([]);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    // This is used only for the example
    const container = window !== undefined ? () => window.document.body : undefined;

    const onLoad = (mapInstance: any) => {
        setMap(mapInstance);
    };

    const onUnmount = () => {
        setMap(null);
    };

    const handleMenuOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const apiKey: string = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

    const mapOptions = {
        fullscreenControl: false,
        mapTypeControl: false
    }

    const handleMenuItemClick = (item: number) => {
        onFilterLocations({
            dueDateOption: item
        })
        handleMenuClose();
    };

    const toggleView = () => setIsListView(!isListView);

    const markerOnClick = (structure: Structure) => {
        onSelectStructure(structure)
        setOpen(true);
    }

    const onTxtSearchInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const searchValue = event.target.value;
        if (searchValue) {
            const filteredList = structureList.filter(structure => structure.name.toLowerCase().includes(searchValue.toLowerCase()));
            setStructureList(filteredList);
        } else {
            setStructureList(structures || []);
        }
    }

    return (
        <Root>
            <CssBaseline />
            <Box sx={{ position: 'relative', minWidth: 520, minHeight: 520 }}>
                <LoadScript googleMapsApiKey={apiKey}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={deafaultCenter}
                        zoom={13}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={mapOptions}

                    >
                        {structureList?.map((structure) => {
                            return (
                                <Marker
                                    key={structure.id}
                                    position={{ lat: structure.location.latitude, lng: structure.location.longitude }}
                                    onClick={() => markerOnClick(structure)}
                                />
                            )
                        }
                        )}
                    </GoogleMap>
                </LoadScript>

                <Fab
                    color="primary"
                    aria-label="zoom-in"
                    sx={{ position: 'absolute', top: 16, right: 80 }}
                    onClick={handleMenuOpen}
                >
                    <FilterListIcon />
                </Fab>
                <Menu
                    id="filter-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem disabled>Due Dates</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(0)}>All</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(1)}>Passed Due Date</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(2)}>Next Week</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(3)}>Next Month</MenuItem>
                </Menu>

                <Fab
                    color="primary"
                    aria-label="zoom-out"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                    onClick={toggleView}
                >
                    <ListIcon />
                </Fab>

                <SearchBar elevation={3}>
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                    <SearchInput
                        placeholder="Search here ..."
                        fullWidth
                        onChange={onTxtSearchInput}
                        id='txtSearchInput'
                    />
                </SearchBar>
            </Box>
            {
                (!selectedStructure.name) ?
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Select a bridge to start an inspection.
                        </Typography>
                    </Box>
                    :
                    <SwipeableDrawer
                        container={container}
                        anchor="bottom"
                        open={open}
                        onClose={toggleDrawer(false)}
                        onOpen={toggleDrawer(true)}
                        swipeAreaWidth={DRAWER_BLEEDING}
                        disableSwipeToOpen={false}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            '& .MuiPaper-root': {
                                overflow: 'visible',
                            },
                        }}
                    >
                        <StyledBox
                            sx={{
                                position: 'absolute',
                                top: -DRAWER_BLEEDING,
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                visibility: 'visible',
                                right: 0,
                                left: 0,
                            }}
                        >
                            <Puller />
                        </StyledBox>
                        <StyledBox className={styles.structureDetailSectionBox}>
                            <StructureDetailSection
                                selectedStructure={selectedStructure}
                                onStartClickHandler={onStartClickHandler}
                            />

                        </StyledBox>
                    </SwipeableDrawer>
            }
        </Root>

    );
};

export default MapContainer;
