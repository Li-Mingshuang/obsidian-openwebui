import { App, PluginSettingTab } from 'obsidian';
import OpenWebUIPlugin from './main';

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

export class OpenWebUISettingTab extends PluginSettingTab {
    plugin: OpenWebUIPlugin;

    constructor(app: App, plugin: OpenWebUIPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'OpenWebUI 设置' });

        new Setting(containerEl)
            .setName('服务器端口')
            .setDesc('OpenWebUI 服务器运行的端口')
            .addText(text => text
                .setPlaceholder('8080')
                .setValue(this.plugin.settings.serverPort.toString())
                .onChange(async (value) => {
                    this.plugin.settings.serverPort = parseInt(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('自动启动')
            .setDesc('打开 Obsidian 时自动启动 OpenWebUI 服务')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoStart)
                .onChange(async (value) => {
                    this.plugin.settings.autoStart = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('默认模型')
            .setDesc('选择默认使用的 AI 模型')
            .addText(text => text
                .setPlaceholder('llama2')
                .setValue(this.plugin.settings.modelName)
                .onChange(async (value) => {
                    this.plugin.settings.modelName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API 端点')
            .setDesc('OpenWebUI API 的访问地址')
            .addText(text => text
                .setPlaceholder('http://localhost:8080')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));
    }
} 