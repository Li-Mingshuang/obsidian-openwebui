import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { OpenWebUIPluginInterface } from '../types';

export const VIEW_TYPE_OPENWEBUI = 'openwebui-view';

export class OpenWebUIView extends ItemView {
    private plugin: OpenWebUIPluginInterface;
    private iframe: HTMLIFrameElement;

    constructor(leaf: WorkspaceLeaf, plugin: OpenWebUIPluginInterface) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_OPENWEBUI;
    }

    getDisplayText(): string {
        return 'OpenWebUI';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('openwebui-container');

        this.iframe = container.createEl('iframe');
        this.iframe.addClass('openwebui-frame');
        this.iframe.src = this.plugin.settings.apiEndpoint;
        this.iframe.setAttr('frameborder', '0');
        
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

    async onClose(): Promise<void> {
        // 清理工作
    }
} 