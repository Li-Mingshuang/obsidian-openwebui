import { OpenWebUISettings } from '../types';
import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class ServerManager {
    private process: ChildProcess | null = null;
    private settings: OpenWebUISettings;

    constructor(settings: OpenWebUISettings) {
        this.settings = settings;
    }

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            // 展开 ~ 到用户主目录
            const workingDir = this.settings.serverWorkingDir.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
            
            // 分割命令和参数
            const [cmd, ...args] = this.settings.serverCommand.split(' ');
            
            this.process = spawn(cmd, args, {
                cwd: workingDir,
                shell: true
            });

            // 处理输出
            this.process.stdout?.on('data', (data) => {
                console.log(`[OpenWebUI] ${data}`);
            });

            this.process.stderr?.on('data', (data) => {
                console.error(`[OpenWebUI] ${data}`);
            });

            this.process.on('error', (err) => {
                new Notice(`OpenWebUI 启动失败: ${err.message}`);
                console.error('[OpenWebUI] Failed to start:', err);
                this.process = null;
            });

            this.process.on('exit', (code) => {
                if (code !== 0) {
                    new Notice(`OpenWebUI 进程异常退出，代码: ${code}`);
                }
                console.log(`[OpenWebUI] Process exited with code ${code}`);
                this.process = null;
            });

            new Notice('OpenWebUI 服务已启动');
        } catch (error) {
            new Notice(`启动 OpenWebUI 失败: ${error.message}`);
            console.error('[OpenWebUI] Failed to start:', error);
            this.process = null;
        }
    }

    async stop(): Promise<void> {
        if (!this.process) {
            return;
        }

        try {
            // 在 Windows 上使用 taskkill，在其他平台使用 SIGTERM
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
            } else {
                this.process.kill('SIGTERM');
            }

            this.process = null;
            new Notice('OpenWebUI 服务已停止');
        } catch (error) {
            new Notice(`停止 OpenWebUI 失败: ${error.message}`);
            console.error('[OpenWebUI] Failed to stop:', error);
        }
    }

    isRunning(): boolean {
        return this.process !== null;
    }
} 