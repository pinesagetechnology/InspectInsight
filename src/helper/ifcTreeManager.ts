import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import { ClaculatedIFCElementCodeData, StructureElement } from "../entities/structure";
import { IFCPopulatedConditionRating } from "../entities/inspection";

const getDecompositionTree = async (
    indexer: OBC.IfcRelationsIndexer,
    model: FRAGS.FragmentsGroup,
    expressID: number,
    inverseAttributes: OBC.InverseAttribute[],
) => {
    const rows: BUI.TableGroupData[] = [];

    const entityAttrs = await model.getProperties(expressID);
    if (!entityAttrs) return rows;
    const { type } = entityAttrs;
    const entityRow: BUI.TableGroupData = {
        data: {
            Entity: OBC.IfcCategoryMap[type],
            Name: entityAttrs.Name?.value,
            modelID: model.uuid,
            expressID,
        },
    };

    for (const attrName of inverseAttributes) {
        const relations = indexer.getEntityRelations(model, expressID, attrName);
        if (!relations) continue;
        if (!entityRow.children) entityRow.children = [];
        entityRow.data.relations = JSON.stringify(relations);
        const entityGroups: any = {};
        for (const id of relations) {
            const decompositionRow = await getDecompositionTree(
                indexer,
                model,
                id,
                inverseAttributes,
            );
            for (const row of decompositionRow) {
                if (row.data.relations) {
                    entityRow.children.push(row);
                } else {
                    const data = model.data.get(id);
                    if (!data) {
                        entityRow.children.push(row);
                        continue;
                    }
                    const type = data[1][1];
                    const entity = OBC.IfcCategoryMap[type];
                    if (!(entity in entityGroups)) entityGroups[entity] = [];
                    row.data.Entity = row.data.Name;
                    delete row.data.Name;
                    entityGroups[entity].push(row);
                }
            }
        }

        for (const entity in entityGroups) {
            const children = entityGroups[entity];
            const relations = children.map((child: any) => child.data.expressID);
            const row: BUI.TableGroupData = {
                data: {
                    Entity: entity,
                    modelID: model.uuid,
                    relations: JSON.stringify(relations),
                },
                children,
            };
            entityRow.children.push(row);
        }
    }

    rows.push(entityRow);

    return rows;
};

export const computeRowData = async (
    components: OBC.Components,
    models: Iterable<FRAGS.FragmentsGroup>,
    inverseAttributes: OBC.InverseAttribute[],
    expressID?: number,
) => {
    const indexer = components.get(OBC.IfcRelationsIndexer);
    const rows: BUI.TableGroupData[] = [];
    for (const model of models) {

        let modelData: BUI.TableGroupData;
        if (expressID) {
            modelData = {
                data: {
                    Entity: model.name !== "" ? model.name : model.uuid,
                },
                children: await getDecompositionTree(
                    indexer,
                    model,
                    expressID,
                    inverseAttributes,
                ),
            };
        } else {
            const modelRelations = indexer.relationMaps[model.uuid];
            const projectAttrs = await model.getAllPropertiesOfType(
                WEBIFC.IFCPROJECT,
            );

            if (!(modelRelations && projectAttrs)) continue;
            const { expressID } = Object.values(projectAttrs)[0];
            modelData = {
                data: {
                    Entity: model.name !== "" ? model.name : model.uuid,
                },
                children: await getDecompositionTree(
                    indexer,
                    model,
                    expressID,
                    inverseAttributes,
                ),
            };
        }
        rows.push(modelData);
    }
    return rows;
};

export const getRowFragmentIdMap = (model: FRAGS.FragmentsGroup,
    rowData: any) => {
    const { modelID, expressID, relations } = rowData as {
        modelID: string;
        expressID: number;
        relations: string;
    };
    const fragmentIDMap = model.getFragmentMap([
        expressID,
        ...JSON.parse(relations ?? "[]"),
    ]);
    return fragmentIDMap;
};

export const addQuantityToElements = (elements: StructureElement[]): StructureElement[] => {
    return elements.map((element) => {
        const updatedChildren = addQuantityToElements(element.children);
        return {
            ...element,
            // Set quantity to the number of immediate children
            quantity: updatedChildren.length,
            children: updatedChildren,
        };
    });
};

export const filterTree = (nodes: StructureElement[], query: string): StructureElement[] => {
    return nodes
        .map((node) => {
            const children = filterTree(node.children || [], query);
            const isMatch =
                node.data.Entity?.toString().toLowerCase().includes(query.toLowerCase()) ||
                node.data.Name?.toString().toLowerCase().includes(query.toLowerCase());
            if (isMatch || children.length > 0) {
                return { ...node, children };
            }
            return null;
        })
        .filter((node) => node !== null) as StructureElement[];
}

export const flattenDataTree = (nodes: StructureElement[]): StructureElement[] => {
    const result: StructureElement[] = [];

    for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
            result.push(node);
        } else {
            result.push(...flattenDataTree(node.children));
        }
    }

    return result;
}

// Add this helper function at the top of the file
export const groupElementsByType = (elements: StructureElement[]): Record<string, StructureElement[]> => {
    const flatList = flattenDataTree(elements);

    return flatList.reduce((acc, item) => {
        const type = item.data.Entity?.toString() || 'Other';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {} as Record<string, StructureElement[]>);
};

export const getMetaDataFromIFCStructureElement = (ifcStructureElemeents: StructureElement[]): ClaculatedIFCElementCodeData[] => {
    const counts: Record<string, number> = {};

    const traverse = (node: StructureElement) => {
        if (node.children?.length === 0) {
            const name = node.data.Name;
            if (name) {
                // strip off the final colon‐segment (numeric tag)
                const parts = name.split(':');
                const code = parts.length > 1
                    ? parts.slice(0, -1).join(':')
                    : name;

                counts[code] = (counts[code] || 0) + 1;
            }
        }
        node.children?.forEach(traverse);
    }

    ifcStructureElemeents.forEach(traverse);

    const result: ClaculatedIFCElementCodeData[] = Object.entries(counts).map(([code, count]) => ({
        elementCode: code,
        totalQty: count,
    } as ClaculatedIFCElementCodeData));

    return result;
}

export const getRatingDistribution = (metaDataList: ClaculatedIFCElementCodeData[], ifcRatedElement: StructureElement[]) => {
    const distMap: Record<string, [number, number, number, number]> = {};
    const ifcRatedElementDist: IFCPopulatedConditionRating[] = []
    metaDataList.forEach(({ elementCode, totalQty }) => {
        distMap[elementCode] = [0, 0, 0, 0];
        ifcRatedElementDist.push({
            elementCode,
            totalQty: totalQty,
            condition: [0, 0, 0, 0],
        });
    });

    for (const el of ifcRatedElement) {
        const parts = el.data.Name?.split(':') || [];
        const code = parts.length > 1 ? parts.slice(0, -1).join(':') : el.data.Name;

        if (!code) continue;
        const bucket = distMap[code];

        if (!bucket) continue;

        el.condition?.forEach((val, i) => {
            if (val > 0) {
                bucket[i] += 1;
            }
        });
    }

    return ifcRatedElementDist.map((item) => {
        const foundItem = Object.entries(distMap).find(([key]) => key === item.elementCode);
        return {
            ...item,
            condition: foundItem ? foundItem[1] : [0, 0, 0, 0],
        } as IFCPopulatedConditionRating;
    })

}