import React, {
    ChangeEvent,
    useEffect,
    useRef,
    useState
} from 'react';
import {
    GoogleMap,
    useJsApiLoader
} from '@react-google-maps/api';
import {
    Box,
    Button,
    Checkbox,
    CssBaseline,
    Divider,
    Fab,
    InputBase,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    SwipeableDrawer,
    Switch,
    Typography,
    useMediaQuery
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import FilterListIcon from '@mui/icons-material/FilterList';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { Search as SearchIcon } from '@mui/icons-material';
import { Structure } from '../../entities/structure';
import { FilterModel } from '../../models/map';
import StructureDetailSection from './structureDetail';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentStructure, getStructureDisplayMode } from '../../store/Structure/selectors';
import { DRAWER_BLEEDING, filtersByCategory } from '../../constants';
import RefreshIcon from '@mui/icons-material/Refresh';
import * as structureActions from "../../store/Structure/actions";
import styles from './style.module.scss';
import { PayloadAction } from '@reduxjs/toolkit';
import { StructureUrgencyEnum } from '../../enums';

// IMPORTANT: adjust these to your design
const containerStyle = { width: '100%', height: '80vh' };
const defaultCenter = { lat: -33.8523, lng: 151.2108 };

const Root = styled('div')(({ theme }) => ({
    height: '100%',
    backgroundColor: grey[100],
    ...theme.applyStyles('dark', { backgroundColor: theme.palette.background.default }),
}));
const StyledBox = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.applyStyles('dark', { backgroundColor: grey[800] }),
}));
const Puller = styled('div')(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: grey[300],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
    ...theme.applyStyles('dark', { backgroundColor: grey[900] }),
}));

const lightTheme = createTheme({ palette: { mode: 'light' } });
const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 50,
    lineHeight: '60px',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const SearchInput = styled(InputBase)({
    flex: 1,
    marginLeft: 8,
    width: '40px',
    '& input::placeholder': { fontSize: '16px' },
});

const LIBRARIES: (
    | 'places'
    | 'marker'
)[] = ['places', 'marker'];

const MAP_IDS = [
    process.env.REACT_APP_GOOGLE_MAPS_MAP_ID!
];

const LOADER_ID = 'google-map-script';

interface MapComponentProps {
    structures?: Structure[];
    isListView: boolean;
    onSelectStructure: (structure: Structure) => void;
    applyFilter: (filters: Record<string, string[]>) => void;
    setIsListView: (flag: boolean) => void;
    onStartClickHandler: () => void;
    handleDisplayModeChange: (value: string) => void;
    structureMode: string;
}

const MapContainer: React.FC<MapComponentProps> = ({
    structures,
    isListView,
    onSelectStructure,
    applyFilter,
    setIsListView,
    onStartClickHandler,
    handleDisplayModeChange,
    structureMode
}) => {
    console.log("structureMode", structureMode);
    const dispatch = useDispatch();
    const selectedStructure = useSelector(getCurrentStructure);

    const [structureList, setStructureList] = useState<Structure[]>(structures || []);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});

    // Media queries for responsive design
    const isTablet = useMediaQuery('(max-width:962px)');
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const isLandscape = useMediaQuery('(orientation: landscape)');

    // Keep track of created markers so we can remove them later
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const mapRef = useRef<google.maps.Map | null>(null);
    const isMountedRef = useRef(true);

    // Function to create markers - extracted for reusability
    const createMarkers = async () => {
        if (!isLoaded || !mapRef.current || !isMountedRef.current) return;

        console.log("Creating markers for", structureList.length, "structures");

        // Clear existing markers first
        markersRef.current.forEach(m => m.map = null);
        markersRef.current = [];

        try {
            // Dynamically import the marker module
            const markerLib = await google.maps.importLibrary('marker') as any;
            const { AdvancedMarkerElement } = markerLib;

            const getPinColor = (urgency: string | undefined) => {
                switch (urgency) {
                    case StructureUrgencyEnum.High:
                        return 'red';
                    case StructureUrgencyEnum.Medium:
                        return 'orange';
                    case StructureUrgencyEnum.Low:
                        return 'green';
                    case StructureUrgencyEnum.Overdue:
                        return 'purple';
                    default:
                        return 'gray';
                }
            };

            const getMarkerContent = (color: string) => {
                const div = document.createElement('div');
                div.style.backgroundColor = color;
                div.style.border = '2px solid white';
                div.style.borderRadius = '50%';
                div.style.width = '16px';
                div.style.height = '16px';
                div.style.boxShadow = '0 0 3px rgba(0,0,0,0.6)';
                return div;
            };

            const newMarkers = structureList.map(struct => {
                const color = getPinColor(struct.urgency);
                const content = getMarkerContent(color);

                const marker = new AdvancedMarkerElement({
                    map: mapRef.current!,
                    position: {
                        lat: struct.location.latitude,
                        lng: struct.location.longitude
                    },
                    title: struct.name,
                    content
                });
                marker.addListener('click', () => {
                    onSelectStructure(struct);
                    setOpenDrawer(true);
                });
                return marker;
            });

            markersRef.current = newMarkers;
        } catch (err) {
            console.error('Marker creation failed', err);
        }
    };

    // Load Maps JS + marker library + your mapId
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
        libraries: LIBRARIES,
        mapIds: MAP_IDS,
        id: LOADER_ID,
    });

    // Effect to handle map initialization
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            // Clean up markers when component unmounts
            if (markersRef.current) {
                markersRef.current.forEach(m => m.map = null);
                markersRef.current = [];
            }
        };
    }, []);

    // Effect for marker creation
    useEffect(() => {
        if (isLoaded && mapRef.current) {
            createMarkers();
        }
    }, [isLoaded, structureList, onSelectStructure]);

    // Additional effect to recreate markers when map reference changes
    useEffect(() => {
        if (mapRef.current && isLoaded) {
            createMarkers();
        }
    }, [mapRef.current]);

    // Update local copy of structures when prop changes
    useEffect(() => {
        setStructureList(structures || []);
    }, [structures]);

    // Drawer handlers
    const toggleDrawer = (newOpen: boolean) => () => setOpenDrawer(newOpen);
    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // List toggle
    const toggleView = () => setIsListView(!isListView);

    const onRefreshMapClick = () => {
        dispatch({
            type: structureActions.FETCH_STRUCTURES_DATA
        } as PayloadAction);
    }

    // Text search
    const onTxtSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase();
        setStructureList(
            val
                ? (structures || []).filter(s => s.name.toLowerCase().includes(val))
                : (structures || [])
        );
    };

    const onApplyFilterClick = () => {
        applyFilter(selectedItems);
        handleMenuClose();
    }

    const clearFilters = () => {
        setSelectedItems({});
        applyFilter({})
        handleMenuClose();
    }

    const handleToggle = (category: string, item: string) => {
        setSelectedItems((prev) => {
            const current = prev[category] || [];
            return {
                ...prev,
                [category]: current.includes(item)
                    ? current.filter((i) => i !== item)
                    : [...current, item],
            };
        });
    };

    const onDisplayModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("event", event.target.checked);
        handleDisplayModeChange(event.target.checked ? 'ifc' : 'element');
    }

    if (loadError) return <div>Error loading Google Maps</div>;
    if (!isLoaded) return <div>Loading map…</div>;

    return (
        <Root>
            <CssBaseline />
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={8}
                    options={{ mapId: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID!, fullscreenControl: false, mapTypeControl: false }}
                    onLoad={map => {
                        console.log("Map loaded");
                        mapRef.current = map;
                        // Create markers immediately after map loads
                        if (structures && structures.length > 0) {
                            setTimeout(() => createMarkers(), 100);
                        }
                    }}
                    onUnmount={() => {
                        console.log("Map unmounted");
                        if (markersRef.current) {
                            markersRef.current.forEach(m => m.map = null);
                        }
                        mapRef.current = null;
                    }}
                />

                {/* FAB buttons - responsive positioning */}
                <Fab
                    color="primary"
                    size={isPortrait ? "small" : "medium"}
                    sx={{
                        position: 'absolute',
                        top: isTablet ? 8 : 16,
                        right: isPortrait ? 60 : 80
                    }}
                    onClick={onRefreshMapClick}
                >
                    <RefreshIcon />
                </Fab>

                <Fab
                    color="primary"
                    size={isPortrait ? "small" : "medium"}
                    sx={{
                        position: 'absolute',
                        top: isTablet ? 8 : 16,
                        right: isPortrait ? 116 : 136
                    }}
                    onClick={handleMenuOpen}
                >
                    <FilterListIcon />
                </Fab>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    {filtersByCategory.map((group, index) => (
                        <div key={group.category}>
                            {index > 0 && <Divider />}
                            <Typography sx={{ px: 2, pt: 1, fontWeight: 'bold' }} variant="body2">
                                {group.category}
                            </Typography>
                            {group.items.map((item) => (
                                <MenuItem key={item} onClick={() => handleToggle(group.category, item)}>
                                    <Checkbox
                                        checked={selectedItems[group.category]?.includes(item) || false}
                                    />
                                    <ListItemText primary={item} />
                                </MenuItem>
                            ))}
                        </div>
                    ))}
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={clearFilters} color="secondary" fullWidth>
                            Clear
                        </Button>
                        <Button variant="contained" onClick={onApplyFilterClick} fullWidth>
                            Apply
                        </Button>
                    </Box>
                </Menu>

                <Fab
                    color="primary"
                    size={isPortrait ? "small" : "medium"}
                    sx={{
                        position: 'absolute',
                        top: isTablet ? 8 : 16,
                        right: isPortrait ? 8 : 16
                    }}
                    onClick={toggleView}
                >
                    <ListIcon />
                </Fab>

                {/* Structure Mode switch */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: isTablet ? -3 : 5,
                        right: isTablet ? 196 : 500,
                    }}
                >
                    <ThemeProvider theme={lightTheme}>
                        <Item elevation={8}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography>Mode:</Typography>
                                <Typography>{structureMode}</Typography>
                                <Switch checked={structureMode === 'ifc'} color="warning" onChange={onDisplayModeChange} />
                            </Stack>
                        </Item>
                    </ThemeProvider>
                </Box>

                {/* Search bar - responsive width and positioning */}
                {!isPortrait && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            top: isTablet ? 8 : 16,
                            right: isTablet ? 196 : 195,
                            display: 'flex',
                            alignItems: 'center',
                            p: '8px 16px',
                            width: isTablet ? '40%' : '30%',
                            maxWidth: isLandscape ? '300px' : '250px'
                        }}
                    >
                        <SearchIcon fontSize="small" />
                        <SearchInput placeholder="Search here ..." fullWidth onChange={onTxtSearchInput} />
                    </Paper>
                )}

                {/* Mobile search - positioned below FABs in portrait mode */}
                {isPortrait && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            top: 60,
                            left: 16,
                            right: 16,
                            display: 'flex',
                            alignItems: 'center',
                            p: '8px 16px'
                        }}
                    >
                        <SearchIcon fontSize="small" />
                        <SearchInput placeholder="Search here ..." fullWidth onChange={onTxtSearchInput} />
                    </Paper>
                )}


            </Box>

            {!selectedStructure.name ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>Select a bridge to start an inspection.</Typography>
                </Box>
            ) : (
                <SwipeableDrawer
                    anchor="bottom"
                    open={openDrawer}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    swipeAreaWidth={DRAWER_BLEEDING}
                    disableSwipeToOpen={false}
                    ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiPaper-root': { overflow: 'visible' } }}
                >
                    <StyledBox sx={{ position: 'absolute', top: -DRAWER_BLEEDING, right: 0, left: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8, visibility: 'visible' }}>
                        <Puller />
                    </StyledBox>
                    <StyledBox className={styles.structureDetailSectionBox}>
                        <StructureDetailSection onStartClickHandler={onStartClickHandler} selectedStructure={selectedStructure} />
                    </StyledBox>
                </SwipeableDrawer>
            )}
        </Root>
    );
};

export default MapContainer;