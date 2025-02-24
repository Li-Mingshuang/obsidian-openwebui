import { Plugin, WorkspaceLeaf } from 'obsidian';
import { OpenWebUISettings, DEFAULT_SETTINGS } from './types';
import { OpenWebUIView, VIEW_TYPE_OPENWEBUI } from './views/OpenWebUIView';
import { OpenWebUISettingTab } from './settings';
import { ServerManager } from './services/server';

export default class OpenWebUIPlugin extends Plugin {
    settings: OpenWebUISettings;
    private server: ServerManager;
    
    async onload() {
        await this.loadSettings();
        
        this.server = new ServerManager(this.settings);
        
        // 注册视图
        this.registerView(
            VIEW_TYPE_OPENWEBUI,
            (leaf: WorkspaceLeaf) => new OpenWebUIView(leaf, this.settings)
        );
        
        // 添加图标到侧边栏
        this.addRibbonIcon('message-square', 'OpenWebUI', () => {
            this.activateView();
        });
        
        // 添加设置页面
        this.addSettingTab(new OpenWebUISettingTab(this.app, this));

        // 如果设置为自动启动，则启动服务
        if (this.settings.autoStart) {
            await this.server.start();
        }

        // 添加命令
        this.addCommand({
            id: 'toggle-openwebui',
            name: '切换 OpenWebUI 视图',
            callback: () => {
                this.activateView();
            }
        });

        this.addCommand({
            id: 'start-openwebui',
            name: '启动 OpenWebUI 服务',
            callback: async () => {
                await this.server.start();
            }
        });

        this.addCommand({
            id: 'stop-openwebui',
            name: '停止 OpenWebUI 服务',
            callback: async () => {
                await this.server.stop();
            }
        });
    }
    
    async onunload() {
        await this.server.stop();
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_OPENWEBUI);
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    async activateView() {
        const workspace = this.app.workspace;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_OPENWEBUI)[0];
        if (!leaf) {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({
                type: VIEW_TYPE_OPENWEBUI,
                active: true,
            });
        }
        
        workspace.revealLeaf(leaf);
    }
} 