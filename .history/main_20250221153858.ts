import { Plugin, WorkspaceLeaf } from 'obsidian';
import { OpenWebUISettings, DEFAULT_SETTINGS } from './settings';
import { OpenWebUIView, VIEW_TYPE_OPENWEBUI } from './views/OpenWebUIView';

export default class OpenWebUIPlugin extends Plugin {
    settings: OpenWebUISettings;
    
    async onload() {
        await this.loadSettings();
        
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
    }
    
    async onunload() {
        // 清理工作
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