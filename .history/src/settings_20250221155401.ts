import { App, PluginSettingTab, Setting } from 'obsidian';
import type { OpenWebUIPluginInterface } from './types';

export class OpenWebUISettingTab extends PluginSettingTab {
    private plugin: OpenWebUIPluginInterface;

    constructor(app: App, plugin: OpenWebUIPluginInterface) {
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
            .setName('Web 地址')
            .setDesc('OpenWebUI 的访问地址')
            .addText(text => text
                .setPlaceholder('http://localhost:8080')
                .setValue(this.plugin.settings.webUrl)
                .onChange(async (value) => {
                    this.plugin.settings.webUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('启动命令')
            .setDesc('启动 OpenWebUI 服务的命令')
            .addText(text => text
                .setPlaceholder('python -m openwebui')
                .setValue(this.plugin.settings.serverCommand)
                .onChange(async (value) => {
                    this.plugin.settings.serverCommand = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('工作目录')
            .setDesc('OpenWebUI 服务的工作目录')
            .addText(text => text
                .setPlaceholder('~/open-webui')
                .setValue(this.plugin.settings.serverWorkingDir)
                .onChange(async (value) => {
                    this.plugin.settings.serverWorkingDir = value;
                    await this.plugin.saveSettings();
                }));
    }
} 