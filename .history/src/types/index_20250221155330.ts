import type { Plugin } from 'obsidian';

export interface OpenWebUISettings {
    autoStart: boolean;
    webUrl: string;
    serverCommand: string;
    serverWorkingDir: string;
}

export const DEFAULT_SETTINGS: OpenWebUISettings = {
    autoStart: true,
    webUrl: 'http://localhost:8080',
    serverCommand: 'python -m openwebui',
    serverWorkingDir: '~/open-webui'
};

export interface OpenWebUIPluginInterface extends Plugin {
    settings: OpenWebUISettings;
    saveSettings(): Promise<void>;
} 