import { App, PluginSettingTab, Setting } from 'obsidian';
import type OpenWebUIPlugin from './main';

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
            .setName('自动启动')
            .setDesc('打开 Obsidian 时自动启动 OpenWebUI 服务')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoStart)
                .onChange(async (value) => {
                    this.plugin.settings.autoStart = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('服务地址')
            .setDesc('OpenWebUI 服务的访问地址')
            .addText(text => text
                .setPlaceholder('http://localhost:8081')
                .setValue(this.plugin.settings.serverUrl)
                .onChange(async (value) => {
                    this.plugin.settings.serverUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('服务端口')
            .setDesc('OpenWebUI 服务的运行端口')
            .addText(text => text
                .setPlaceholder('8081')
                .setValue(this.plugin.settings.serverPort.toString())
                .onChange(async (value) => {
                    const port = parseInt(value);
                    if (!isNaN(port) && port > 0 && port < 65536) {
                        this.plugin.settings.serverPort = port;
                        this.plugin.settings.serverUrl = `http://localhost:${port}`;
                        await this.plugin.saveSettings();
                    }
                }));
    }
} 