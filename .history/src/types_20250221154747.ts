export interface OpenWebUISettings {
    serverPort: number;
    autoStart: boolean;
    modelName: string;
    apiEndpoint: string;
}

export const DEFAULT_SETTINGS: OpenWebUISettings = {
    serverPort: 8080,
    autoStart: true,
    modelName: 'llama2',
    apiEndpoint: 'http://localhost:8080'
}; 