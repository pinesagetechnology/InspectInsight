import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { getRowFragmentIdMap } from "../../helper/ifcTreeManager";
import TreeViewComponent from "../../components/ifcTreeComponent.tsx/treeViewComponent";
import { useDispatch } from "react-redux";
import * as commonActions from "../../store/Common/actions";
import * as WEBIFC from 'web-ifc';
import { Paper, Grid2 as Grid } from "@mui/material";
import classNames from 'classnames';
import { StructureElement } from "../../entities/structure";
import ViewerMenu from "./viewerMenu";
import { useSelector } from "react-redux";
import { getStructureElements } from "../../store/Structure/selectors";
import { getRatedElements } from "../../store/ConditionRating/selectors";
import AssessmentPanel from "./assessmentPanel";
import styles from "./style.module.scss";
import { PayloadAction } from "@reduxjs/toolkit";
import * as ratingActions from "../../store/ConditionRating/actions";

const selectHighlighterName: string = "select";
const Plan: string = "Plan";
const Orbit: string = "Orbit";

interface IFCViewerComponentProps {
    expressID?: number;
}

const IFCViewerComponent: React.FC<IFCViewerComponentProps> = ({
    expressID,
}) => {
    const dispatch = useDispatch();
    const structureElements: StructureElement[] = useSelector(getStructureElements);
    const ratedElements: StructureElement[] = useSelector(getRatedElements);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hiderRef = useRef<OBC.Hider>();
    const highlighterRef = useRef<OBF.Highlighter>();
    const dimensionsRef = useRef<OBF.LengthMeasurement>();
    const worldRef = useRef<OBC.SimpleWorld<OBC.BaseScene, OBC.OrthoPerspectiveCamera, OBC.BaseRenderer>>()
    const clipperRef = useRef<OBC.Clipper>();
    const cameraComponentRef = useRef<OBC.OrthoPerspectiveCamera>();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isMeasurementMode, setIsMeasurementMode] = useState(false);
    const [isClipperOn, setIsClipperOn] = useState(false);
    const [showRatings, setShowRatings] = useState(true);
    const isMeasurementModeRef = useRef(isMeasurementMode);
    const isClipperOnRef = useRef(isClipperOn);
    const selectedItemsRef = useRef<string[]>([]);

    const [isShowTree, setIsShowTree] = useState(true);
    const [labels, setLabels] = useState<THREE.Sprite[]>([])
    const [model, setModel] = useState<FRAGS.FragmentsGroup>();
    const [fragMgr, setFragmentsManager] = useState<OBC.FragmentsManager>();
    const [indx, setIndexer] = useState<OBC.IfcRelationsIndexer>();
    const [isPanSelected, setIsPanSelected] = useState(false);
    const [isOrbitSelected, setIsOrbitSelected] = useState(false);
    const [showConditionPanel, setShowConditionPanel] = useState(false);

    const components = new OBC.Components();

    // Utility function to determine color based on rating
    const getColorForRating = (rating: number): THREE.Color => {
        // Map rating to a color (green for good, yellow for medium, red for poor)
        if (rating <= 1.5) return new THREE.Color(0x00ff00); // Good - Green
        if (rating <= 2.5) return new THREE.Color(0xffff00); // Medium - Yellow
        if (rating <= 3.5) return new THREE.Color(0xff9900); // Poor - Orange
        return new THREE.Color(0xff0000); // Very Poor - Red
    };

    // Function to highlight rated elements
    const highlightRatedElements = () => {
        if (model && ratedElements && ratedElements.length > 0 && highlighterRef.current) {
            if (!showRatings) return;
            ratedElements.forEach((item) => {
                if (item.condition && item.condition.length > 0) {
                    // Calculate average rating
                    let sum = 0;
                    let count = 0;
                    for (let i = 0; i < item.condition.length; i++) {
                        if (item.condition[i] > 0) {
                            sum += item.condition[i];
                            count++;
                        }
                    }

                    if (count > 0) {
                        const avgRating = sum / count;
                        const color = getColorForRating(avgRating);
                        const fragmentIDMap = getRowFragmentIdMap(model, item.data);
                        
                        if (fragmentIDMap) {
                            const fragments = fragMgr?.list;
                            if (fragments) {
                                Object.keys(fragmentIDMap).forEach(fragmentId => {

                                    const fragment = fragments.get(fragmentId);
                                    if (fragment) {

                                        fragment.mesh.material[0] = new THREE.MeshBasicMaterial({
                                            color: color,
                                            transparent: true,
                                            opacity: 0.5,
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    };

    // Toggle showing ratings
    const toggleRatings = () => {
        setShowRatings(!showRatings);
        if (!showRatings) {
            highlightRatedElements();
        } else{
            //undo coloring
        }
    };

    useEffect(() => {
        selectedItemsRef.current = selectedItems;
    }, [selectedItems]);

    useEffect(() => {
        isMeasurementModeRef.current = isMeasurementMode;
    }, [isMeasurementMode]);

    useEffect(() => {
        isClipperOnRef.current = isClipperOn;
    }, [isClipperOn]);

    // Apply highlighting when rated elements change
    useEffect(() => {
        if (model && highlighterRef.current) {
            highlightRatedElements();
        }
    }, [ratedElements, model, showRatings]);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const container = containerRef.current;

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
            OBC.SimpleScene,
            OBC.OrthoPerspectiveCamera,
            OBF.RendererWith2D
        >();

        const sceneComponent = new OBC.SimpleScene(components);
        sceneComponent.setup();
        world.scene = sceneComponent;

        const rendererComponent = new OBF.RendererWith2D(components, container);
        world.renderer = rendererComponent;

        const cameraComponent = new OBC.OrthoPerspectiveCamera(components);
        world.camera = cameraComponent;
        cameraComponentRef.current = cameraComponent;

        const onResize = () => {
            rendererComponent.resize();
            cameraComponent.updateAspect();
        };

        container.addEventListener("resize", onResize);

        components.init();

        // Attach 2D renderer to container
        containerRef.current.appendChild(world.renderer.three2D.domElement);

        const ifcLoader = components.get(OBC.IfcLoader);

        const highlighter = components.get(OBF.Highlighter);
        if (highlighter) {
            highlighter.setup({ world });
            highlighter.zoomToSelection = true;
            highlighterRef.current = highlighter;
        } else {
            console.error("Highlighter could not be initialized.");
        }

        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
            const fragmentId = Object.keys(fragmentIdMap)[0];
            const fragmentExpressId = fragmentIdMap[fragmentId].values().next().value;

            dispatch({
                type: ratingActions.SET_SELECTED_ELEMENT,
                payload: fragmentExpressId
            } as PayloadAction<number>);
            
            setShowConditionPanel(prev => !prev);
        });

        const dimensions = components.get(OBF.LengthMeasurement);
        if (dimensions) {
            dimensions.world = world;
            dimensions.snapDistance = 1;
            dimensionsRef.current = dimensions;
        }

        const fragmentsManager = components.get(OBC.FragmentsManager);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            if (world.scene) {
                dispatch({
                    type: commonActions.CLOSE_LOADING_OVERLAY
                });

                world.scene.three.add(model);

                for (const child of model.children) {
                    if (child instanceof THREE.Mesh) {
                        world.meshes.add(child);
                    }
                }

                // Apply rating highlights after model is loaded
                highlightRatedElements();
            }
        });

        const indexer = components.get(OBC.IfcRelationsIndexer);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            if (model.hasProperties) await indexer.process(model);
        });

        const fetchAndLoad = async () => {
            await ifcLoader.setup({
                autoSetWasm: false,
                wasm: {
                    path: "/",
                    absolute: false
                }
            });

            const file = await fetch("https://psiassetsapidev.blob.core.windows.net/ifcfiles/ifcBridgeSample.ifc");
            const buffer = await file.arrayBuffer();

            const typedArray = new Uint8Array(buffer);
            const model = await ifcLoader.load(typedArray);

            const classifierObj = components.get(OBC.Classifier);
            classifierObj.byEntity(model);

            await classifierObj.bySpatialStructure(model, {
                isolate: new Set([WEBIFC.IFCBUILDINGSTOREY])
            })

            setModel(model);
            setFragmentsManager(fragmentsManager);
            setIndexer(indexer);

            const hider = components.get(OBC.Hider);
            hiderRef.current = hider;
        }

        fetchAndLoad();

        const casters = components.get(OBC.Raycasters);
        casters.get(world);

        const clipper = components.get(OBC.Clipper);

        clipperRef.current = clipper;
        worldRef.current = world;

        container.ondblclick = onContainerDoubleClick;

        // container.onclick = onContainerClick;

        window.onkeydown = (event: KeyboardEvent) => {
            if (event.code === "Delete") {
                if (isMeasurementModeRef.current) {
                    dimensions.delete();
                } else if (isClipperOnRef.current) {
                    clipper.delete(world);
                }
            }
        }

        return () => {
            try {
                if (container) {
                    container.removeEventListener("resize", onResize);
                    container.ondblclick = null;
                    container.onclick = null;
                }
                window.onkeydown = null;

                if (model) {
                    model.traverse((child: any) => {
                        if (child instanceof THREE.Mesh) {
                            child.geometry?.dispose();
                            if (child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach((material: THREE.Material) => {
                                        material.dispose();
                                    })
                                } else {
                                    child.material.dispose();
                                }
                            }
                        }
                    });
                }

                if (dimensionsRef.current) {
                    dimensionsRef.current.deleteAll();
                    dimensionsRef.current.enabled = false;
                }

                if (clipperRef.current) {
                    try {
                        clipperRef.current.deleteAll();
                        clipperRef.current.enabled = false;
                    } catch (e) {
                        console.log(e);
                    }
                }

                if (highlighterRef.current) {
                    try {
                        highlighterRef.current.clear();
                        highlighterRef.current.enabled = false;
                    } catch (e) {
                        console.log(e);
                    }
                }

                if (worldRef.current) {
                    if (worldRef.current.renderer) {
                        const renderer = worldRef.current.renderer;

                        if (renderer.three) {
                            renderer.three.dispose();
                        }
                    }
                }

                highlighterRef.current = undefined;
                dimensionsRef.current = undefined;
                clipperRef.current = undefined;
                hiderRef.current = undefined;
                worldRef.current = undefined;
                cameraComponentRef.current = undefined;

                try {
                    if (components) {
                        components.dispose();
                    }
                } catch (e) {
                    console.log("Error disposing components:", e);
                }
            } catch (e) {
                console.log("Error during cleanup:", e);
            }
        }
    }, [])

    const onContainerClick = (event: MouseEvent) => {
        console.log("onContainerClick", "the event is not being used - To be removed later");
        if (!isClipperOnRef.current && !isMeasurementModeRef.current) {
            const rect = containerRef.current?.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - (rect?.left || 0)) / (rect?.width || 0)) * 2 - 1,
                -((event.clientY - (rect?.top || 0)) / (rect?.height || 0)) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            // Use the Three.js camera from the camera component.
            if (!cameraComponentRef.current) return;

            raycaster.setFromCamera(mouse, cameraComponentRef.current.three);
            // Check for intersections in the scene.
            if (!worldRef.current) return;
            const intersects = raycaster.intersectObjects(worldRef.current.scene.three.children, true);
            if (intersects.length > 0) {
                const selectedMesh = intersects[0].object;
                // Toggle disabled state; here we always set it to disabled for demonstration.
                // toggleDisabled(selectedMesh);
            }
        }
    }

    const processMeasurement = () => {
        if (dimensionsRef.current && worldRef.current && highlighterRef.current) {
            dimensionsRef.current.create();
        }
    }

    const processClipper = () => {
        if (worldRef.current && clipperRef.current?.enabled) {
            clipperRef.current?.create(worldRef.current);
        }
    }

    const onContainerDoubleClick = () => {
        if (isMeasurementModeRef.current) {
            processMeasurement();
        } else if (isClipperOnRef.current) {
            processClipper();
        }
    }

    const handleTreeItemClick = (item: StructureElement) => {
        if (model && model.uuid) {
            const fragmentIDMap = getRowFragmentIdMap(model, item.data);

            if (fragmentIDMap && !isMeasurementMode) {
                highlighterRef.current?.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
            }
        }
    }

    const handleHideSelectedFragment = (node: StructureElement, isVisible: boolean) => {
        if (model && fragMgr && indx) {
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
    }

    const showstructureDetail = () => {
        setIsShowTree(prevFlag => !prevFlag);
    }

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
    }

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
    }

    const removeAllLineMeasurement = () => {
        dimensionsRef.current?.deleteAll();

        for (const label of labels) {
            worldRef.current?.scene.three.remove(label);
            label.material.dispose();
            label.geometry?.dispose();
        }
        labels.length = 0;
    }

    const removeClipper = () => {
        if (clipperRef.current && worldRef.current) {
            clipperRef.current?.deleteAll();
        }
    }

    const onOrbitCameraClick = () => {
        if (isOrbitSelected === false) {
            if (worldRef.current && worldRef.current.camera) {
                worldRef.current.camera.set(Orbit as OBC.NavModeID);
            }
            setIsOrbitSelected(true);
            setIsPanSelected(false);
        }
    }

    const onPanCameraClick = () => {
        if (isPanSelected === false) {
            if (worldRef.current && worldRef.current.camera) {
                worldRef.current.camera.set(Plan as OBC.NavModeID);
            }
            setIsOrbitSelected(false);
            setIsPanSelected(true);
        }
    }

    const onFitScreenClick = () => {
        if (worldRef.current && worldRef.current.camera) {
            worldRef.current.camera.fit(worldRef.current.meshes);
        }
    }

    const onShowConditionPanelClickHandler = () => {
        setShowConditionPanel(prev => !prev);
    }

    const toggleDisabled = (mesh: THREE.Object3D) => {
        console.log("toggleDisabled", "toggle function is being called - to be removed later");
        let isDisabled: boolean = false;

        if (selectedItemsRef.current.includes(mesh.uuid)) {
            isDisabled = false;
        } else {
            isDisabled = true;
        }

        mesh.traverse((child: any) => {
            if (child.isMesh) {
                if (isDisabled) {
                    // Save the original material if it hasn't been saved yet.
                    if (!child.userData.originalMaterial) {
                        child.userData.originalMaterial = child.material;
                    }
                    // Set a wireframe material to simulate a "disabled" state.
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xcccccc,
                        wireframe: true,
                    });

                    setSelectedItems((prevData) => [...prevData, child.uuid]);
                } else {
                    // Restore the original material if it exists.
                    if (child.userData.originalMaterial) {
                        setSelectedItems((prevData) => prevData.filter((item) => item !== child.uuid));
                        child.material = child.userData.originalMaterial;
                    }
                }
            }
        });
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <div id="container" ref={containerRef} style={{ width: '100%', height: '68vh' }} />

                    <Paper elevation={0} className={classNames(styles.treeViewerContainer, (isShowTree) ? styles.showTreePanel : styles.hideTreePanel)}>
                        {
                            model?.uuid &&
                            <TreeViewComponent
                                treeData={structureElements}
                                handleTreeItemClick={handleTreeItemClick}
                                handleFragmentVisibilityChange={handleHideSelectedFragment} />
                        }
                    </Paper>

                    <AssessmentPanel
                        showConditionPanel={showConditionPanel}
                        closePanel={() => setShowConditionPanel(false)}
                    />

                    <ViewerMenu
                        isClipperOn={isClipperOn}
                        isMeasurementMode={isMeasurementMode}
                        isPanSelected={isPanSelected}
                        isOrbitSelected={isOrbitSelected}
                        showRatings={showRatings}
                        onClipperClick={onClipperClick}
                        onMeasurementClick={onMeasurementClick}
                        onFitScreenClick={onFitScreenClick}
                        onOrbitCameraClick={onOrbitCameraClick}
                        onPanCameraClick={onPanCameraClick}
                        // onToggleRatings={toggleRatings}
                        removeAllLineMeasurement={removeAllLineMeasurement}
                        removeClipper={removeClipper}
                        showConditionPanelHandler={onShowConditionPanelClickHandler}
                        showstructureDetail={showstructureDetail}
                    />
                </Grid>

            </Grid>

        </div>
    );

}

export default IFCViewerComponent;