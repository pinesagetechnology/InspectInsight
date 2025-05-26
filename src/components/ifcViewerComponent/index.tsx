import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { getRowFragmentIdMap } from "../../helper/ifcTreeManager";
import { useDispatch, useSelector } from "react-redux";
import * as commonActions from "../../store/Common/actions";
import * as ratingActions from "../../store/ConditionRating/actions";
import { PayloadAction } from "@reduxjs/toolkit";
import { getCurrentStructure, getStructureIFCPath } from "../../store/Structure/selectors";
import { getRatedElements, getSelectedStructureElement } from "../../store/ConditionRating/selectors";
import ViewerMenu from "./viewerMenu";
import AssessmentPanel from "./assessmentPanel";
import { Grid2 as Grid, Box, useMediaQuery, Stack, Tabs, Tab, Button } from "@mui/material";
import { StructureElement } from "../../entities/structure";
import * as WEBIFC from 'web-ifc';
import { getIFCFile } from '../../helper/db';
import { isOnlineSelector } from '../../store/SystemAvailability/selectors';
import IfcListItemComponent from "../ifcListItemComponent";
import { RoutesValueEnum } from "../../enums";
import { useNavigationManager } from "../../navigation";

const selectHighlighterName = "select";
const Plan = "Plan";
const Orbit = "Orbit";

const IFCViewerComponent: React.FC = () => {
    const dispatch = useDispatch();
    const { goTo } = useNavigationManager();

    const ratedElements: StructureElement[] = useSelector(getRatedElements) || [];
    const structureIFCPath: string = useSelector(getStructureIFCPath) || "";
    const isOnline = useSelector(isOnlineSelector);
    const currentStructure = useSelector(getCurrentStructure);
    const selectedStructureElement = useSelector(getSelectedStructureElement);

    // Add theme and media queries for responsive design
    const isTablet = useMediaQuery('(max-width:900px)');
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

    // const [isSelected, setIsSelected] = useState(false);
    const [isPanSelected, setIsPanSelected] = useState(false);
    const [isOrbitSelected, setIsOrbitSelected] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    const [sidebarTab, setSidebarTab] = useState(0);

    // Keep refs in sync
    useEffect(() => { isMeasurementModeRef.current = isMeasurementMode; }, [isMeasurementMode]);
    useEffect(() => { isClipperOnRef.current = isClipperOn; }, [isClipperOn]);

    // Highlight rated elements
    const highlightRatedElements = () => {
        if (model && fragMgrRef.current && ratedElements.length > 0 && highlighterRef.current) {
            ratedElements.forEach((item) => {
                if (item.ifcElementRatingValue) {
                    let color: THREE.Color | undefined;

                    switch (item.ifcElementRatingValue) {
                        case "1":
                            color = new THREE.Color(0x00ff00);
                            break;
                        case "2":
                            color = new THREE.Color(0xffff00);
                            break;
                        case "3":
                            color = new THREE.Color(0xff9900);
                            break;
                        case "4":
                            color = new THREE.Color(0xff0000);
                            break;
                    }

                    const fragmentIDMap = getRowFragmentIdMap(model!, item.data);
                    if (fragmentIDMap) {
                        if (fragMgrRef.current?.list) {
                            Object.keys(fragmentIDMap).forEach(fragmentId => {
                                const fragment = fragMgrRef.current?.list.get(fragmentId);
                                if (fragment && color) {
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
                console.log("id", id);
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

            // Configure IFC Loader with platform-specific WASM path
            const ifcLoader = components.get(OBC.IfcLoader);
            const isNative = window.capacitor?.isNative;
            const wasmPath = isNative
                ? 'public/'  // In native app, files are in the public directory
                : process.env.PUBLIC_URL + '/static/wasm/';  // In web, use the public URL

            console.log('IFC Loader Setup:', { isNative, wasmPath, currentPath: window.location.href });

            ifcLoader.settings.wasm = {
                path: wasmPath,
                absolute: true
            };

            // Load IFC
            try {
                console.log('Starting IFC load process...', { isOnline, structureIFCPath });
                let arrayBuffer: ArrayBuffer;

                if (!isOnline) {
                    console.log('Attempting to load from local storage...');
                    const localFile = await getIFCFile(currentStructure.id);
                    console.log('Local file check:', { hasLocalFile: !!localFile, structureId: currentStructure.id });

                    if (!localFile) {
                        console.error('No local file available');
                        dispatch({ type: commonActions.CLOSE_LOADING_OVERLAY } as PayloadAction);
                        alert('3D model is not available offline. Please connect to internet to download the model first.');
                        return;
                    }

                    arrayBuffer = await localFile.blob.arrayBuffer();
                    console.log('Successfully loaded local file, size:', arrayBuffer.byteLength);
                } else {
                    console.log('Attempting to load from URL...');
                    const url = `https://psiassetsapidev.blob.core.windows.net/${structureIFCPath}`;
                    console.log('Fetching from URL:', url);

                    const resp = await fetch(url);
                    console.log('Fetch response:', { status: resp.status, ok: resp.ok });

                    if (!resp.ok) {
                        throw new Error(`Failed to fetch IFC file: ${resp.statusText}`);
                    }

                    arrayBuffer = await resp.arrayBuffer();
                    console.log('Successfully loaded remote file, size:', arrayBuffer.byteLength);
                }

                console.log('Loading IFC model into viewer...');
                const model = await ifcLoader.load(new Uint8Array(arrayBuffer));
                console.log('Model loaded successfully:', { modelId: model.uuid });
                setModel(model);
                classifierObj.byEntity(model);

                await classifierObj.bySpatialStructure(model, {
                    isolate: new Set([WEBIFC.IFCBUILDINGSTOREY])
                });
                console.log('Model classification complete');

                if (selectedStructureElement) {
                    const fragmentIDMap = getRowFragmentIdMap(model, selectedStructureElement?.data);

                    if (fragmentIDMap && !isMeasurementMode) {
                        highlighterRef.current?.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
                    }
                }

            } catch (e) {
                console.error('IFC load error:', e);
                // Log more details about the error
                if (e instanceof Error) {
                    console.error('Error details:', {
                        name: e.name,
                        message: e.message,
                        stack: e.stack
                    });
                }
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
                // setIsSelected(true);
            } else {
                // setIsSelected(false);
                // clear the selected element
                dispatch({ type: ratingActions.SET_SELECTED_IFC_ELEMENT_ID, payload: -1 } as PayloadAction<number>);
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
        } else {
            if (selectedStructureElement) {
                dispatch({ type: ratingActions.SET_SELECTED_IFC_ELEMENT_ID, payload: selectedStructureElement.data?.expressID } as PayloadAction<number>);
                const randomNumber = Math.floor(Math.random() * 10) + 1;
                dispatch({ type: ratingActions.SET_AUTO_TABLE_ELEMENT_FOCUS, payload: randomNumber } as PayloadAction<number>);
                goTo(RoutesValueEnum.ConditionRating);
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

    const handleFragmentVisibilityChange = (node: StructureElement, isVisible: boolean) => {
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

    const handleListItemClick = (item: StructureElement) => {
        if (model && model.uuid) {
            dispatch({ type: ratingActions.SET_SELECTED_IFC_ELEMENT_ID, payload: item.data.expressID } as PayloadAction<number>);

            // setIsSelected(true);

            const fragmentIDMap = getRowFragmentIdMap(model, item.data);

            if (fragmentIDMap && !isMeasurementMode) {
                highlighterRef.current?.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
            }
        }
    };

    // Custom styles for the viewer container to ensure it fills the available space
    const viewerContainerStyle = {
        width: '100%',
        height: isTablet ? '600px' : '68vh', // 600px for tablet
        position: 'relative' as 'relative'
    };

    // Custom styles for the left sidebar
    const leftSidebarWidth = isTablet ? 170 : '25%';

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Grid container component="div">
                <Grid component="div" sx={{ width: leftSidebarWidth, minWidth: isTablet ? 150 : 200, maxWidth: isTablet ? 200 : 400, flexBasis: leftSidebarWidth, flexGrow: 0, flexShrink: 0 }}>
                    <Box sx={{ height: isTablet ? '600px' : '62vh', backgroundColor: 'rgba(255,255,255,0.98)', boxShadow: '2px 0 10px rgba(0,0,0,0.2)', p: isTablet ? 1 : 2, display: 'flex', flexDirection: 'column', overflowY: 'auto', fontSize: isTablet ? '0.92rem' : '1rem' }}>
                        {isTablet ? (
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Button
                                    variant={sidebarTab === 0 ? 'contained' : 'outlined'}
                                    onClick={() => setSidebarTab(0)}
                                    fullWidth
                                    size="small"
                                    sx={{ fontSize: '0.92rem' }}
                                >
                                    Assessment
                                </Button>
                                <Button
                                    variant={sidebarTab === 1 ? 'contained' : 'outlined'}
                                    onClick={() => setSidebarTab(1)}
                                    fullWidth
                                    size="small"
                                    sx={{ fontSize: '0.92rem' }}
                                >
                                    Elements
                                </Button>
                            </Stack>
                        ) : (
                            <Tabs value={sidebarTab} onChange={(_, v) => setSidebarTab(v)} variant="fullWidth">
                                <Tab label="Assessment" />
                                <Tab label="Elements" />
                            </Tabs>
                        )}
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            {sidebarTab === 0 && (
                                <AssessmentPanel
                                    // isSelected={isSelected}
                                    isTablet={isTablet}
                                />
                            )}
                            {sidebarTab === 1 && (
                                <IfcListItemComponent
                                    handleListItemClick={handleListItemClick}
                                    handleFragmentVisibilityChange={handleFragmentVisibilityChange}
                                />
                            )}
                        </Box>
                    </Box>
                </Grid>
                <Grid component="div" sx={{ flex: 1 }}>
                    {/* The main container for the 3D viewer */}
                    <div
                        ref={containerRef}
                        style={viewerContainerStyle}
                        // onClick={onContainerClick}
                        onDoubleClick={onContainerDoubleClick}
                    >
                    </div>
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
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default IFCViewerComponent;