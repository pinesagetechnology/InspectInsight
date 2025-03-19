import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
// import * as BUI from "@thatopen/ui";
import * as THREE from "three";
import { computeRowData, getRowFragmentIdMap } from "../../helper/ifcTreeManager";
import TreeViewComponent from "../../components/ifcTreeComponent.tsx/treeViewComponent";
import { useDispatch } from "react-redux";
import * as commonActions from "../../store/Common/actions";
import * as WEBIFC from 'web-ifc';
import styles from "./style.module.scss";
import { TableGroupData } from "@thatopen/ui";
import { Paper, Typography } from "@mui/material";
import classNames from 'classnames';
import Divider from '@mui/material/Divider';
import ConditionRatingComponent from "../../components/conditionRatingComponent";
import { StructureElement } from "../../entities/structure";
import ViewerMenu from "./viewerMenu";
import { useSelector } from "react-redux";
import { getStructureElements } from "../../store/Structure/selectors";
import AssessmentPanel from "./assessmentPanel";


const selectHighlighterName: string = "select";
const inverseAttributes: OBC.InverseAttribute[] = ["IsDecomposedBy", "ContainsElements"];
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
    const isMeasurementModeRef = useRef(isMeasurementMode);
    const isClipperOnRef = useRef(isClipperOn);
    const selectedItemsRef = useRef<string[]>([]);

    // const [treeData, setTreeData] = useState<BUI.TableGroupData[]>([]); 
    const [isShowTree, setIsShowTree] = useState(true);
    const [labels, setLabels] = useState<THREE.Sprite[]>([])
    const [model, setModel] = useState<FRAGS.FragmentsGroup>();
    const [fragMgr, setFragmentsManager] = useState<OBC.FragmentsManager>();
    const [indx, setIndexer] = useState<OBC.IfcRelationsIndexer>();
    const [isPanSelected, setIsPanSelected] = useState(false);
    const [isOrbitSelected, setIsOrbitSelected] = useState(false);
    const [showConditionPanel, setShowConditionPanel] = useState(false);

    const components = new OBC.Components();

    useEffect(() => {
        selectedItemsRef.current = selectedItems;
    }, [selectedItems]);

    useEffect(() => {
        isMeasurementModeRef.current = isMeasurementMode;
    }, [isMeasurementMode]);

    useEffect(() => {
        isClipperOnRef.current = isClipperOn;
    }, [isClipperOn]);

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

        container.addEventListener("resize", () => {
            rendererComponent.resize();
            cameraComponent.updateAspect();
        });

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

            //"http://localhost:9090/ifcBridgeSample.ifc" https://thatopen.github.io/engine_components/resources/small.ifc
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

        container.onclick = onContainerClick;

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

                highlighterRef.current = undefined;
                dimensionsRef.current = undefined;
                clipperRef.current = undefined;
                hiderRef.current = undefined;

                world.renderer?.dispose();
                world.scene.dispose();
                world.camera?.dispose();
                fragmentsManager.dispose();
                components.dispose();

            } catch (e) {
                console.log(e);
            }
        }
    }, [])

    const onContainerClick = (event: MouseEvent) => {
        setShowConditionPanel((prev) => {
            if (prev === false) {
                return true;
            }
            return prev
        });
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
                toggleDisabled(selectedMesh);
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

    const handleClick = (item: StructureElement) => {
        if (model && model.uuid) {
            const fragmentIDMap = getRowFragmentIdMap(model, item.data);

            if (fragmentIDMap && !isMeasurementMode) {
                highlighterRef.current?.highlightByID(selectHighlighterName, fragmentIDMap, true, true);
            }

            setShowConditionPanel((prev) => {
                if (prev === false) {
                    return true;
                }
                return prev
            });
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

    const handleConditionChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        elementId: number,
        index: number
    ) => {
        const onlyNums = event.target.value.replace(/[^0-9]/g, '');
        // if (onlyNums) {
        //     const num = parseInt(onlyNums, 10);
        //     if (num >= 1 && num <= 4) { // Ensure the number is between 1 and 4
        //         const newData = displayElements.map((item) => {
        //             if (item.elementId === elementId) {
        //                 const newConditions: number[] = [0, 0, 0, 0];
        //                 [0, 1, 2, 3].forEach(x => {
        //                     if (index === x) {
        //                         newConditions[x] = num;
        //                     } else if (item.condition && item.condition![x]) {
        //                         newConditions[x] = item.condition![x];
        //                     } else {
        //                         newConditions[x] = 0;
        //                     }

        //                 });

        //                 return { ...item, condition: newConditions };
        //             }
        //             return item;
        //         });

        //         dispatch({
        //             payload: newData,
        //             type: actions.UPDATE_DISPLAY_LIST_ITEMS
        //         });
        //     }
        // } else {
        //     // Handle the case where the input is cleared or invalid
        //     const newData = displayElements.map((item) => {
        //         if (item.elementId === elementId) {
        //             const newConditions = [...(item.condition || [])];

        //             newConditions[index] = 0;

        //             return { ...item, condition: newConditions };
        //         }
        //         return item;
        //     });

        //     dispatch({
        //         payload: newData,
        //         type: actions.UPDATE_DISPLAY_LIST_ITEMS
        //     });
        // }
    };

    const onShowConditionPanelClickHandler = () => {
        setShowConditionPanel(prev => !prev);
    }

    // Define a function to toggle the mesh's material.
    const toggleDisabled = (mesh: THREE.Object3D) => {
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
            <div id="container" ref={containerRef} style={{ width: '100%', height: '68vh' }} />
            <ViewerMenu
                isClipperOn={isClipperOn}
                isMeasurementMode={isMeasurementMode}
                isPanSelected={isPanSelected}
                isOrbitSelected={isOrbitSelected}
                onClipperClick={onClipperClick}
                onMeasurementClick={onMeasurementClick}
                onFitScreenClick={onFitScreenClick}
                onOrbitCameraClick={onOrbitCameraClick}
                onPanCameraClick={onPanCameraClick}
                removeAllLineMeasurement={removeAllLineMeasurement}
                removeClipper={removeClipper}
                showConditionPanelHandler={onShowConditionPanelClickHandler}
                showstructureDetail={showstructureDetail}
            />

            <Paper elevation={0} className={classNames(styles.treeViewerContainer, (isShowTree) ? styles.showTreePanel : styles.hideTreePanel)}>
                {
                    model?.uuid &&
                    <TreeViewComponent
                        treeData={structureElements}
                        handleClick={handleClick}
                        handleFragmentVisibilityChange={handleHideSelectedFragment} />
                }
            </Paper>

            <AssessmentPanel
                showConditionPanel={showConditionPanel}
                element={{} as StructureElement}
                handleConditionChange={handleConditionChange} />
        </div>
    );

}

export default IFCViewerComponent;