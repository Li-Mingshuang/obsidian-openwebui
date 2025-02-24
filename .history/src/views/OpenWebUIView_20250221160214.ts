import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { OpenWebUISettings } from '../types';

export const VIEW_TYPE_OPENWEBUI = 'openwebui-view';

export class OpenWebUIView extends ItemView {
    private settings: OpenWebUISettings;
    private iframe: HTMLIFrameElement;

    constructor(leaf: WorkspaceLeaf, settings: OpenWebUISettings) {
        super(leaf);
        this.settings = settings;
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
        this.iframe.src = this.settings.serverUrl;
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
        if (this.iframe) {
            this.iframe.remove();
        }
    }
} 