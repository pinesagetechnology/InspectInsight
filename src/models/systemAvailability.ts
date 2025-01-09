export interface SystemStatus {
    isOnline: boolean;
    lastChecked: number;
}

export interface OfflineAction {
    type: string;
    payload: any;
    meta: {
        timestamp: number;
        offlineAction: boolean;
    };
}