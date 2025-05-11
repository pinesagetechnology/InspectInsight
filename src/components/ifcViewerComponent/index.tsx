import React, { useEffect, useRef, useState, useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { getRowFragmentIdMap } from "../../helper/ifcTreeManager";
import TreeViewComponent from "../../components/ifcTreeComponent.tsx/treeViewComponent";
import { useDispatch, useSelector } from "react-redux";
import * as commonActions from "../../store/Common/actions";
import * as ratingActions from "../../store/ConditionRating/actions";
import { PayloadAction } from "@reduxjs/toolkit";
import { getCurrentStructure, getStructureElements, getStructureIFCPath } from "../../store/Structure/selectors";
import { getRatedElements } from "../../store/ConditionRating/selectors";
import ViewerMenu from "./viewerMenu";
import AssessmentPanel from "./assessmentPanel";
import { Grid2 as Grid, Paper, Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { StructureElement } from "../../entities/structure";
import * as WEBIFC from 'web-ifc';
import CloseIcon from '@mui/icons-material/Close';
import { getIFCFile } from '../../helper/db';
import { isOnlineSelector } from '../../store/SystemAvailability/selectors';

const selectHighlighterName = "select";
const Plan = "Plan";
const Orbit = "Orbit";

const IFCViewerComponent: React.FC = () => {
    const dispatch = useDispatch();
    const structureElements: StructureElement[] = useSelector(getStructureElements) || [];
    const ratedElements: StructureElement[] = useSelector(getRatedElements) || [];
    const structureIFCPath: string = useSelector(getStructureIFCPath) || "";
    const isOnline = useSelector(isOnlineSelector);
    const currentStructure = useSelector(getCurrentStructure);

    // Add theme and media queries for responsive design
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallTablet = useMediaQuery('(max-width:600px)');

    const containerRef = useRef<HTMLDivElement | null>(null);
    const worldRef = useRef<OBC.SimpleWorld<any, any, any>>();
    const cameraRef = useRef<OBC.OrthoPerspectiveCamera>();
    const fragMgrRef = useRef<OBC.FragmentsManager>();
    const indexerRef = useRef<OBC.IfcRelationsIndexer>();

    const highlighterRef = useRef<OBF.Highlighter>();
    const hiderRef = useRef<OBC.Hider>();
    const dimensionsRef = useRef<OBF.LengthMeasurement>();
    const clipperRef = useRef<OBC.Clipper>();

    const [model, setModel] = useState<FRAGS.FragmentsGroup>();
    const [isMeasurementMode, setIsMeasurementMode] = useState(false);
    const [isClipperOn, setIsClipperOn] = useState(false);
    const isMeasurementModeRef = useRef(isMeasurementMode);
    const isClipperOnRef = useRef(isClipperOn);

    const [isShowTree, setIsShowTree] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isPanSelected, setIsPanSelected] = useState(false);
    const [isOrbitSelected, setIsOrbitSelected] = useState(false);
    const [showConditionPanel, setShowConditionPanel] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    // Keep refs in sync
    useEffect(() => { isMeasurementModeRef.current = isMeasurementMode; }, [isMeasurementMode]);
    useEffect(() => { isClipperOnRef.current = isClipperOn; }, [isClipperOn]);

    // Close panels when in tablet mode and orientation changes
    useEffect(() => {
        const handleOrientationChange = () => {
            if (isTablet && isShowTree) {
                setIsShowTree(false);
            }
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [isTablet, isShowTree]);

    // Highlight rated elements
    const highlightRatedElements = () => {
        if (model && fragMgrRef.current && ratedElements.length > 0 && highlighterRef.current) {
            ratedElements.forEach((item) => {
                if (item.condition && item.condition.length) {
                    const valid = item.condition.filter(c => c > 0);
                    if (valid.length) {
                        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;

                        const color = avg <= 1.5 ? new THREE.Color(0x00ff00)
                            : avg <= 2.5 ? new THREE.Color(0xffff00)
                                : avg <= 3.5 ? new THREE.Color(0xff9900)
                                    : new THREE.Color(0xff0000);
                        const fragmentIDMap = getRowFragmentIdMap(model!, item.data);
                        if (fragmentIDMap) {
                            if (fragMgrRef.current?.list) {
                                Object.keys(fragmentIDMap).forEach(fragmentId => {
                                    const fragment = fragMgrRef.current?.list.get(fragmentId);
                                    if (fragment) {
                                        fragment.mesh.material[0] = new THREE.MeshBasicMaterial({
                                            color: color,
                                            transparent: true,
                                            opacity: 0.5,
                                        });
                                    }
                                })
                            }
                        }
                    }
                }
            });
        }
    }

    useEffect(() => {
        if (isModelLoaded)
            highlightRatedElements();
    }, [isModelLoaded, highlightRatedElements]);

    // Initialize viewer
    useEffect(() => {
        let isMounted = true;
        setIsModelLoaded(false);
        const components = new OBC.Components();

        const setup = async () => {
            if (!containerRef.current) return;

            // Create world
            const worlds = components.get(OBC.Worlds);
            const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.RendererWith2D>();
            world.scene = new OBC.SimpleScene(components);
            world.renderer = new OBF.RendererWith2D(components, containerRef.current);
            world.camera = new OBC.OrthoPerspectiveCamera(components);
            cameraRef.current = world.camera;
            worldRef.current = world;

            // Bootstrap
            components.init();
            world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);
            world.scene.setup();

            // Highlighter
            const highlighter = components.get(OBF.Highlighter);
            highlighter.setup({ world });
            highlighter.zoomToSelection = true;
            highlighterRef.current = highlighter;
            highlighter.events.select.onHighlight.add((fragMap) => {
                const key = Object.keys(fragMap)[0];
                const id = fragMap[key].values().next().value;

                dispatch({ type: ratingActions.SET_SELECTED_IFC_ELEMENT_ID, payload: id } as PayloadAction<number>);
            });

            // Measurement
            const dimensions = components.get(OBF.LengthMeasurement);
            dimensions.world = world;
            dimensions.snapDistance = 1;
            dimensionsRef.current = dimensions;

            // Clipper & Hider
            clipperRef.current = components.get(OBC.Clipper);
            clipperRef.current.Type = OBF.EdgesPlane;
            hiderRef.current = components.get(OBC.Hider);
            const classifierObj = components.get(OBC.Classifier);

            // Fragments Manager & Indexer
            const fragmentsManager = components.get(OBC.FragmentsManager);
            fragMgrRef.current = fragmentsManager;
            fragmentsManager.onFragmentsLoaded.add((loadedModel) => {
                if (!isMounted) return;
                dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);

                world.scene.three.add(loadedModel);

                loadedModel.children.forEach(child => child instanceof THREE.Mesh && world.meshes.add(child));

                highlightRatedElements();
            });
            const idx = components.get(OBC.IfcRelationsIndexer);
            indexerRef.current = idx;

            fragmentsManager.onFragmentsLoaded.add((loadedModel) => {
                if (loadedModel.hasProperties) idx.process(loadedModel);
            });

            // Configure IFC Loader
            const ifcLoader = components.get(OBC.IfcLoader);
            ifcLoader.settings.wasm = { path: process.env.PUBLIC_URL + '/', absolute: true };

            // Load IFC
            try {
                let arrayBuffer: ArrayBuffer;

                if (!isOnline) {
                    // We're offline, try to load from local storage
                    const localFile = await getIFCFile(currentStructure.id);

                    if (!localFile) {
                        // No local file available
                        dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);
                        alert('3D model is not available offline. Please connect to internet to download the model first.');
                        return;
                    }

                    arrayBuffer = await localFile.blob.arrayBuffer();
                } else {
                    // We're online, fetch from URL
                    const url = `https://psiassetsapidev.blob.core.windows.net/${structureIFCPath}`;
                    const resp = await fetch(url);

                    if (!resp.ok) {
                        throw new Error(`Failed to fetch IFC file: ${resp.statusText}`);
                    }

                    arrayBuffer = await resp.arrayBuffer();
                }

                const model = await ifcLoader.load(new Uint8Array(arrayBuffer));
                setModel(model);
                classifierObj.byEntity(model);

                await classifierObj.bySpatialStructure(model, {
                    isolate: new Set([WEBIFC.IFCBUILDINGSTOREY])
                })

            } catch (e) {
                console.error('IFC load error:', e);
                dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);
            }

            setIsModelLoaded(true);
        };

        setup();
        return () => { isMounted = false; components.dispose(); };
    }, []);

    useEffect(() => {
        const onResize = () => {
            worldRef.current?.renderer.resize();
            worldRef.current?.camera.updateAspect();
        };

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isClipperOnRef.current && !isMeasurementModeRef.current) {
            const rect = containerRef.current?.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - (rect?.left || 0)) / (rect?.width || 0)) * 2 - 1,
                -((event.clientY - (rect?.top || 0)) / (rect?.height || 0)) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            // Use the Three.js camera from the camera component.
            if (!cameraRef.current) return;

            raycaster.setFromCamera(mouse, cameraRef.current.three);
            // Check for intersections in the scene.
            if (!worldRef.current) return;
            const intersects = raycaster.intersectObjects(worldRef.current.scene.three.children, true);

            if (intersects.length > 0) {
                setIsSelected(true);
            } else {
                setIsSelected(false);
            }

            // Auto-close the tree panel on tablet when clicking elsewhere
            if (isTablet && isShowTree) {
                setIsShowTree(false);
            }
        }
    };

    const onContainerDoubleClick = () => {
        if (isMeasurementModeRef.current) {
            if (dimensionsRef.current && worldRef.current && highlighterRef.current) {
                dimensionsRef.current.create();
            }
        } else if (isClipperOnRef.current) {
            if (worldRef.current && clipperRef.current?.enabled) {
                clipperRef.current?.create(worldRef.current);
            }
        }
    };

    const onClipperClick = () => {
        setIsClipperOn((prevFlag) => {
            if (highlighterRef.current && clipperRef.current) {
                if (!prevFlag) {
                    clipperRef.current.enabled = true;
                    highlighterRef.current.clear();
                    highlighterRef.current.enabled = false
                }
                else {
                    clipperRef.current.enabled = false;
                    if (isMeasurementModeRef.current === false) {
                        highlighterRef.current.enabled = true
                    }
                }
            }
            return !prevFlag
        });
    };

    const onMeasurementClick = () => {
        setIsMeasurementMode((prevFlag) => {
            if (dimensionsRef.current && highlighterRef.current) {
                if (!prevFlag) {
                    dimensionsRef.current.enabled = true;
                    highlighterRef.current.clear();
                    highlighterRef.current.enabled = false
                }
                else {
                    dimensionsRef.current.enabled = false;
                    if (isClipperOnRef.current === false) {
                        highlighterRef.current.enabled = true
                    }
                }
            }
            return !prevFlag
        });
    };

    const onOrbitCameraClick = () => {
        if (isOrbitSelected === false) {
            if (worldRef.current && worldRef.current.camera) {
                worldRef.current.camera.set(Orbit as OBC.NavModeID);
            }
            setIsOrbitSelected(true);
            setIsPanSelected(false);
        }
    };

    const onPanCameraClick = () => {
        if (isPanSelected === false) {
            if (worldRef.current && worldRef.current.camera) {
                worldRef.current.camera.set(Plan as OBC.NavModeID);
            }
            setIsOrbitSelected(false);
            setIsPanSelected(true);
        }
    };

    const handleHideSelectedFragment = (node: StructureElement, isVisible: boolean) => {
        if (model && fragMgrRef.current && indexerRef.current) {
            const fragmentProperties = model.getLocalProperties();
            if (fragmentProperties) {
                const matchingIDs = Object.entries(fragmentProperties)
                    .filter(([key, value]) => {
                        return (value?.Name && value?.Name?.value === node.data.Name?.toLocaleString())
                    })
                    .map(([key]) => parseInt(key));

                const fragmentMap = model.getFragmentMap(matchingIDs);

                if (hiderRef.current && fragmentMap) {
                    hiderRef.current.set(isVisible, fragmentMap);
                }
            }
        }
    };

    const handleTreeItemClick = (item: StructureElement) => {
        if (model && model.uuid) {
            const fragmentIDMap = getRowFragmentIdMap(model, item.data);

            if (fragmentIDMap && !isMeasurementMode) {
                highlighterRef.current?.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
            }

            // Auto-close tree panel after selection on small tablets
            if (isSmallTablet) {
                setIsShowTree(false);
            }
        }
    };

    // Custom styles for tree panel with responsive adjustments
    const treeViewPanelStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: isTablet ? '55%' : '25%', // Wider on tablet
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)', // More opaque for better readability on tablet
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        overflowY: 'auto',
        transform: isShowTree ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        padding: isTablet ? '10px' : '16px', // Less padding on tablet
        display: 'flex',
        flexDirection: 'column'
    };

    // Custom styles for the viewer container to ensure it fills the available space
    const viewerContainerStyle = {
        width: '100%',
        height: isTablet ? '60vh' : '68vh', // Shorter on tablet
        position: 'relative' as 'relative'
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Grid container spacing={2}>
                <Grid size={12}>
                    {/* The main container for the 3D viewer */}
                    <div
                        ref={containerRef}
                        style={viewerContainerStyle}
                        onClick={onContainerClick}
                        onDoubleClick={onContainerDoubleClick}
                    >
                        {/* Custom Tree Panel that slides in/out */}
                        {model && (
                            <Paper
                                elevation={3}
                                sx={treeViewPanelStyle}
                            >
                                {/* Close button for the tree panel - especially important on tablet */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    width: '100%',
                                    mb: 1
                                }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsShowTree(false)}
                                        sx={{
                                            display: isTablet ? 'flex' : 'none'  // Only show on tablet
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                <TreeViewComponent
                                    treeData={structureElements}
                                    handleTreeItemClick={handleTreeItemClick}
                                    handleFragmentVisibilityChange={handleHideSelectedFragment}
                                />
                            </Paper>
                        )}
                    </div>

                    <AssessmentPanel
                        showConditionPanel={showConditionPanel}
                        isSelected={isSelected}
                        isTablet={isTablet}
                        closeConditionPanelHandler={() => setShowConditionPanel(false)}
                    />

                    <ViewerMenu
                        isClipperOn={isClipperOn}
                        isMeasurementMode={isMeasurementMode}
                        isPanSelected={isPanSelected}
                        isOrbitSelected={isOrbitSelected}
                        onClipperClick={onClipperClick}
                        onMeasurementClick={onMeasurementClick}
                        onFitScreenClick={() => worldRef.current?.camera.fit(worldRef.current.meshes)}
                        onOrbitCameraClick={onOrbitCameraClick}
                        onPanCameraClick={onPanCameraClick}
                        removeAllLineMeasurement={() => dimensionsRef.current?.deleteAll()}
                        removeClipper={() => clipperRef.current?.deleteAll()}
                        showConditionPanelHandler={() => setShowConditionPanel(prev => !prev)}
                        showstructureDetail={() => setIsShowTree(prev => !prev)}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default IFCViewerComponent;