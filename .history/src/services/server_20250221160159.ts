import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class ServerManager {
    private process: ChildProcess | null = null;

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            this.process = spawn('open-webui', ['serve'], {
                shell: true
            });

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
        if (!this.process || typeof this.process.pid !== 'number') {
            return;
        }

        try {
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