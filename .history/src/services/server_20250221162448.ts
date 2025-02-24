import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class ServerManager {
    private process: ChildProcess | null = null;

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            const openWebuiPath = '/opt/miniconda3/bin/open-webui';
            console.log(`[OpenWebUI] Using path: ${openWebuiPath}`);

            // 启动服务
            this.process = spawn(openWebuiPath, ['serve'], {
                shell: true,
                env: {
                    ...process.env,
                    PATH: `/opt/miniconda3/bin:${process.env.PATH}`,
                    CONDA_PREFIX: '/opt/miniconda3'
                }
            });

            // 等待服务启动
            let isStarted = false;
            const startTimeout = setTimeout(() => {
                if (!isStarted) {
                    new Notice('OpenWebUI 服务启动超时，请检查日志');
                }
            }, 10000);

            this.process.stdout?.on('data', (data) => {
                const output = data.toString();
                console.log(`[OpenWebUI] ${output}`);
                if (output.includes('Application startup complete')) {
                    isStarted = true;
                    clearTimeout(startTimeout);
                    new Notice('OpenWebUI 服务已启动');
                }
            });

            this.process.stderr?.on('data', (data) => {
                console.error(`[OpenWebUI] ${data}`);
            });

            this.process.on('error', (err) => {
                clearTimeout(startTimeout);
                new Notice(`OpenWebUI 启动失败: ${err.message}`);
                console.error('[OpenWebUI] Failed to start:', err);
                this.process = null;
            });

            this.process.on('exit', (code) => {
                clearTimeout(startTimeout);
                if (code !== 0) {
                    new Notice(`OpenWebUI 进程异常退出，代码: ${code}`);
                }
                console.log(`[OpenWebUI] Process exited with code ${code}`);
                this.process = null;
            });

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
                
                // 确保所有相关进程都被终止
                spawn('pkill', ['-f', 'open-webui serve']);
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