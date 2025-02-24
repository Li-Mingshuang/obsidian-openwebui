import { ItemView, WorkspaceLeaf } from 'obsidian';
import OpenWebUIPlugin from '../main';

export const VIEW_TYPE_OPENWEBUI = 'openwebui-view';

export class OpenWebUIView extends ItemView {
    plugin: OpenWebUIPlugin;
    iframe: HTMLIFrameElement;

    constructor(leaf: WorkspaceLeaf, plugin: OpenWebUIPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_OPENWEBUI;
    }

    getDisplayText(): string {
        return 'OpenWebUI';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('openwebui-container');

        // 创建 iframe 来加载 OpenWebUI
        this.iframe = container.createEl('iframe');
        this.iframe.addClass('openwebui-frame');
        this.iframe.src = this.plugin.settings.apiEndpoint;
        this.iframe.setAttr('frameborder', '0');
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .openwebui-container {
                padding: 0;
                width: 100%;
                height: 100%;
            }
            .openwebui-frame {
                width: 100%;
                height: 100%;
                border: none;
                background: var(--background-primary);
            }
        `;
        document.head.appendChild(style);
    }

    async onClose() {
        // 清理工作
    }
} 