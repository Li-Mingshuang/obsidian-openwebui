# Obsidian Open WebUI Plugin

[English](README_EN.md) | 中文

在 Obsidian 中集成 Open WebUI，提供 AI 助手功能。

## 功能特点

- 自动管理 Open WebUI 服务
- 提供侧边栏聊天界面
- 支持自定义端口和配置
- 自动启动服务

## 安装要求

- Obsidian v0.15.0 或更高版本
- Open WebUI（通过 conda 安装）
- macOS/Linux（目前仅支持）

## 使用方法

1. 确保已安装 Open WebUI：
   ```bash
   conda install -c conda-forge open-webui
   ```

2. 在 Obsidian 中安装插件：
   - 进入设置 -> 第三方插件
   - 关闭安全模式
   - 点击浏览并搜索 "Open WebUI"

3. 配置插件：
   - 设置服务端口（默认 8081）
   - 配置自动启动选项

## 问题反馈

如果遇到问题，请在 [GitHub Issues](https://github.com/Li-Mingshuang/obsidian-openwebui/issues) 提交反馈。

## 许可证

[MIT License](LICENSE)
