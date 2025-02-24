export interface OpenWebUISettings {
    autoStart: boolean;
    serverUrl: string;
}

export const DEFAULT_SETTINGS: OpenWebUISettings = {
    autoStart: true,
    serverUrl: 'http://localhost:8080'
}; 