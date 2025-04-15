import { MenuItemModel } from "./models/menuItemModel";

export const SYSTEM_AVAILABILITY_KEY = "Healthy";
export const DRAWER_BLEEDING = 56;
export const inspectionTypeItem = [
    {
        text: "Monitor", value: "Monitor"
    },
    {
        text: "Normal", value: "Normal"
    },
    {
        text: "Test bore", value: "Test bore"
    },
    {
        text: "Underwater", value: "Underwater"
    },
] as MenuItemModel[];


export const weatherTypeItem = [
    {
        text: "Cloudy", value: "Cloudy"
    },
    {
        text: "Rainy", value: "Rainy"
    },
    {
        text: "Showers", value: "Showers"
    },
    {
        text: "Sunny", value: "Sunny"
    },
    {
        text: "Windy", value: "Windy"
    },
] as MenuItemModel[];

export const inspectionLevelItem = [
    {
        text: "Level 2", value: "Level 2"
    },
    {
        text: "Level 3", value: "Level 3"
    },
] as MenuItemModel[];

export const ProbabilityItem = [
    {
        text: "Rare", value: "Rare"
    },
    {
        text: "Likely", value: "Likely"
    },
] as MenuItemModel[];

export const ConsequenceOfInteractionItem = [
    {
        text: "Insignificant", value: "Insignificant"
    },
    {
        text: "Moderate", value: "Moderate"
    },
] as MenuItemModel[];

export const ActivityInactionRiskItem = [
    {
        text: "Low", value: "Low"
    },
    {
        text: "High", value: "High"
    },
] as MenuItemModel[];


export const defaultDateValue = "0001-01-01T00:00:00";