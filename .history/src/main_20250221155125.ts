import { Plugin, WorkspaceLeaf } from 'obsidian';
import { OpenWebUISettings, DEFAULT_SETTINGS } from './types';
import { OpenWebUIView, VIEW_TYPE_OPENWEBUI } from './views/OpenWebUIView';
import { OpenWebUISettingTab } from './settings';
import { ServerManager } from './services/server';

export default class OpenWebUIPlugin extends Plugin {
    public settings: OpenWebUISettings;
    private server: ServerManager;
    
    async onload(): Promise<void> {
        await this.loadSettings();
        
        this.server = new ServerManager(this.settings);
        
        // 注册视图
        this.registerView(
            VIEW_TYPE_OPENWEBUI,
            (leaf: WorkspaceLeaf) => new OpenWebUIView(leaf, this)
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
    }
    
    async onunload(): Promise<void> {
        // 停止服务
        await this.server.stop();
        // 清理视图
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_OPENWEBUI);
    }
    
    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
    
    async activateView(): Promise<void> {
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