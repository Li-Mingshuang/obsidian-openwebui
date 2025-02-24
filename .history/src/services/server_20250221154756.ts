import { OpenWebUISettings } from '../types';
import { ChildProcess, spawn } from 'child_process';

export class ServerManager {
    private process: ChildProcess | null = null;
    private settings: OpenWebUISettings;

    constructor(settings: OpenWebUISettings) {
        this.settings = settings;
    }

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        // TODO: 实现服务启动逻辑
        console.log('Starting OpenWebUI server...');
    }

    async stop(): Promise<void> {
        if (!this.process) {
            return;
        }

        // TODO: 实现服务停止逻辑
        console.log('Stopping OpenWebUI server...');
    }

    isRunning(): boolean {
        return this.process !== null;
    }
} 