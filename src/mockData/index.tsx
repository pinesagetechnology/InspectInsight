import { ConditionRatingEntity, InspectionEntity, MaintenanceActionEntity } from "../entities/inspection";
import { Structure, StructureElement } from "../entities/structure";

export const sampleElements: StructureElement[] = [
  {
    elementId: "1",
    code: "BR-100",
    description: "Main Bridge",
    quantity: 1,
    unit: "piece",
    elementCode: "MB-1",
    eciChannel: "1001",
    children: [
      {
        elementId: "2",
        code: "BR-101",
        description: "Substructure",
        quantity: 2,
        unit: "piece",
        elementCode: "SS-1",
        eciChannel: "1002",
        children: [
          {
            elementId: "3",
            code: "BR-102",
            description: "Pier",
            quantity: 4,
            unit: "piece",
            elementCode: "P-1",
            eciChannel: "1003"
          },
          {
            elementId: "4",
            code: "BR-103",
            description: "Abutment",
            quantity: 2,
            unit: "piece",
            elementCode: "A-1",
            eciChannel: "1004"
          }
        ]
      },
      {
        elementId: "5",
        code: "BR-104",
        description: "Superstructure",
        quantity: 1,
        unit: "piece",
        elementCode: "SS-2",
        eciChannel: "1005",
        children: [
          {
            elementId: "6",
            code: "BR-105",
            description: "Deck",
            quantity: 1,
            unit: "piece",
            elementCode: "D-1",
            eciChannel: "1006"
          },
          {
            elementId: "7",
            code: "BR-106",
            description: "Bearings",
            quantity: 8,
            unit: "piece",
            elementCode: "B-1",
            eciChannel: "1007"
          }
        ]
      }
    ]
  },
  {
    elementId: "8",
    code: "BR-200",
    description: "Secondary Bridge",
    quantity: 1,
    unit: "piece",
    elementCode: "SB-1",
    eciChannel: "2001",
    children: [
      {
        elementId: "9",
        code: "BR-201",
        description: "Foundation",
        quantity: 3,
        unit: "piece",
        elementCode: "F-1",
        eciChannel: "2002"
      },
      {
        elementId: "10",
        code: "BR-202",
        description: "Columns",
        quantity: 6,
        unit: "piece",
        elementCode: "C-1",
        eciChannel: "2003"
      }
    ]
  },
  {
    elementId: "11",
    code: "BR-300",
    description: "Tertiary Bridge",
    quantity: 1,
    unit: "piece",
    elementCode: "TB-1",
    eciChannel: "3001",
    children: [
      {
        
        elementId: "12",
        code: "BR-301",
        description: "Supports",
        quantity: 5,
        unit: "piece",
        elementCode: "S-1",
        eciChannel: "3002"
      },
      {
        elementId: "13",
        code: "BR-302",
        description: "Rails",
        quantity: 2,
        unit: "meters",
        elementCode: "R-1",
        eciChannel: "3003",
        children: [
          {
            elementId: "14",
            code: "BR-303",
            description: "Rail Head",
            quantity: 2,
            unit: "meters",
            elementCode: "RH-1",
            eciChannel: "3004"
          },
          {
            elementId: "15",
            code: "BR-304",
            description: "Rail Base",
            quantity: 2,
            unit: "meters",
            elementCode: "RB-1",
            eciChannel: "3005",
            children: [
              {
                elementId: "19",
                code: "BR-201",
                description: "Foundation",
                quantity: 3,
                unit: "piece",
                elementCode: "F-1",
                eciChannel: "2002"
              },
              {
                elementId: "110",
                code: "BR-202",
                description: "Columns",
                quantity: 6,
                unit: "piece",
                elementCode: "C-1",
                eciChannel: "2003"
              }
            ]
          }
        ]
      }
    ]
  }
];

export const mockStructures: Structure[] = [
  {
    id: '1',
    name: 'Golden Gate Bridge',
    code: 'GGB01',
    type: 'bridge',
    overal: 'large',
    at: 'SF',
    overalLength: '2737 m',
    overalWidth: '27 m',
    maxCmy: 15,
    maxMd: 18,
    lastInspectionDate: '2024-10-15T06:09:51.119Z',
    location: { latitude: -33.8523, longitude: 151.2108, region: "Zone 1" },
    elementMetadata: [...sampleElements],
  },
  {
    id: '2',
    name: 'test Bridge',
    code: 'GGB02',
    type: 'bridge',
    overal: 'large',
    at: 'SF',
    overalLength: '2737 m',
    overalWidth: '27 m',
    maxCmy: 15,
    maxMd: 18,
    lastInspectionDate: '2024-10-10T06:09:51.119Z',
    location: { latitude: -33.8691, longitude: 151.1861, region: "Zone 1" },
    elementMetadata: [...sampleElements],
  },
];
export const conditionRatings: ConditionRatingEntity[] = [
  {
    conditionRatingId: "CR-1",
    elementId: "3",  // Pier
    ratings: [1234, 2345, 3456, 4567]
  },
  {
    conditionRatingId: "CR-2",
    elementId: "4",  // Abutment
    ratings: [5678, 6789, 7890, 8901]
  },
  {
    conditionRatingId: "CR-3",
    elementId: "6",  // Deck
    ratings: [9012, 1012, 1123, 1234]
  },
  {
    conditionRatingId: "CR-4",
    elementId: "7",  // Bearings
    ratings: [2345, 3456, 4567, 5678]
  },
  {
    conditionRatingId: "CR-5",
    elementId: "9",  // Foundation
    ratings: [6789, 7890, 8901, 9012]
  },
  {
    conditionRatingId: "CR-6",
    elementId: "10", // Columns
    ratings: [1123, 2234, 3345, 4456]
  },
  {
    conditionRatingId: "CR-7",
    elementId: "12", // Supports
    ratings: [5567, 6678, 7789, 8890]
  },
  {
    conditionRatingId: "CR-8",
    elementId: "14", // Rail Head
    ratings: [9901, 1012, 1123, 1234]
  },
  {
    conditionRatingId: "CR-9",
    elementId: "15", // Rail Base
    ratings: [2345, 3456, 4567, 5678]
  }
];

export const mockPreviousInspectionData: InspectionEntity = {
  id: "insp-001",
  structureId: "struct-123",
  inspectionType: "Routine",
  inspectionLevel: "Level 1",
  temperature: 22.5,
  inspectorName: "John Doe",
  inspectionDate: "2024-10-15T10:00:00Z",
  nextInspectionProposedDate: "2025-04-15T10:00:00Z",
  weather: "Sunny",
  engineerName: "Jane Smith",
  rate: "Good",
  comment: "The structure is in good condition with minor wear and tear.",
  maintenanceActions: [
    {
      id: "maint-001",
      activityDescription: "Replace worn-out bolts on the bridge deck",
    } as MaintenanceActionEntity,
    {
      id: "maint-002",
      activityDescription: "Repaint rusted areas",
    } as MaintenanceActionEntity,
  ],
  conditionRatings: [...conditionRatings],
};

