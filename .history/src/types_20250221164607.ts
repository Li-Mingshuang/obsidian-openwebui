export interface OpenWebUISettings {
    autoStart: boolean;
    serverUrl: string;
    serverPort: number;
}

export const DEFAULT_SETTINGS: OpenWebUISettings = {
    autoStart: true,
    serverUrl: 'http://localhost:8081',
    serverPort: 8081
}; 