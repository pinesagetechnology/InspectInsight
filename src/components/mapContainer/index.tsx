// src/components/mapContainer/index.tsx
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
    CssBaseline,
    Fab,
    InputBase,
    Menu,
    MenuItem,
    Paper,
    SwipeableDrawer,
    Typography
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import FilterListIcon from '@mui/icons-material/FilterList';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { Search as SearchIcon } from '@mui/icons-material';
import { Structure } from '../../entities/structure';
import { FilterModel } from '../../models/map';
import StructureDetailSection from './structureDetail';
import { useSelector } from 'react-redux';
import { getCurrentStructure } from '../../store/Structure/selectors';
import { DRAWER_BLEEDING } from '../../constants';
import styles from './style.module.scss';

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
const SearchBar = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: 16,
    right: 150,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    boxShadow: theme.shadows[2],
    borderRadius: 8,
    width: '30%',
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
    onFilterLocations: (filter: FilterModel) => void;
    setIsListView: (flag: boolean) => void;
    onStartClickHandler: () => void;
}

const MapContainer: React.FC<MapComponentProps> = ({
    structures,
    isListView,
    onSelectStructure,
    onFilterLocations,
    setIsListView,
    onStartClickHandler
}) => {
    const selectedStructure = useSelector(getCurrentStructure);
    const [structureList, setStructureList] = useState<Structure[]>(structures || []);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    // Keep track of created markers so we can remove them later
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const mapRef = useRef<google.maps.Map | null>(null);

    // 1️⃣ Load Maps JS + marker library + your mapId
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
        libraries: LIBRARIES,
        mapIds: MAP_IDS,
        id: LOADER_ID,
    });

    // 2️⃣ When your structures change or map loads, re-create markers
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        // Remove old markers
        markersRef.current.forEach(m => m.map = null);
        markersRef.current = [];

        // Dynamically import the marker module
        google.maps.importLibrary('marker')
            .then((library: any) => {
                const { AdvancedMarkerElement } = library;
                const newMarkers = structureList.map(struct => {
                    const marker = new AdvancedMarkerElement({
                        map: mapRef.current!,
                        position: {
                            lat: struct.location.latitude,
                            lng: struct.location.longitude
                        },
                        title: struct.name
                    });
                    marker.addListener('click', () => {
                        onSelectStructure(struct);
                        setOpenDrawer(true);
                    });
                    return marker;
                });
                markersRef.current = newMarkers;
            })
            .catch(err => console.error('Marker import failed', err));
    }, [isLoaded, structureList, onSelectStructure]);

    // update local copy of structures when prop changes
    useEffect(() => {
        setStructureList(structures || []);
    }, [structures]);

    // Drawer handlers
    const toggleDrawer = (newOpen: boolean) => () => setOpenDrawer(newOpen);
    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // Filtering
    const handleMenuItemClick = (opt: number) => {
        onFilterLocations({ dueDateOption: opt });
        handleMenuClose();
    };

    // List toggle
    const toggleView = () => setIsListView(!isListView);

    // Text search
    const onTxtSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase();
        setStructureList(
            val
                ? (structures || []).filter(s => s.name.toLowerCase().includes(val))
                : (structures || [])
        );
    };

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
                        mapRef.current = map;
                    }}
                    onUnmount={() => {
                        mapRef.current = null;
                        markersRef.current.forEach(m => m.map = null);
                    }}
                />

                <Fab color="primary" sx={{ position: 'absolute', top: 16, right: 80 }} onClick={handleMenuOpen}>
                    <FilterListIcon />
                </Fab>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem disabled>Due Dates</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(0)}>All</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(1)}>Passed Due Date</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(2)}>Next Week</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(3)}>Next Month</MenuItem>
                </Menu>

                <Fab color="primary" sx={{ position: 'absolute', top: 16, right: 16 }} onClick={toggleView}>
                    <ListIcon />
                </Fab>

                <Paper elevation={3} sx={{ position: 'absolute', top: 16, right: 150, display: 'flex', alignItems: 'center', p: '8px 16px', width: '30%' }}>
                    <SearchIcon fontSize="small" />
                    <SearchInput placeholder="Search here ..." fullWidth onChange={onTxtSearchInput} />
                </Paper>
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
