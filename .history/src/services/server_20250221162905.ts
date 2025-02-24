import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class ServerManager {
    private process: ChildProcess | null = null;

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            // 首先检查 conda 环境
            console.log('[OpenWebUI] Checking conda environment...');
            
            // 使用 conda run 来确保在正确的环境中运行
            const command = 'conda';
            const args = ['run', '-n', 'base', 'open-webui', 'serve'];
            
            console.log(`[OpenWebUI] Running command: ${command} ${args.join(' ')}`);

            // 启动服务
            this.process = spawn(command, args, {
                shell: true,
                env: {
                    ...process.env,
                    // 确保使用完整的路径
                    PATH: `/opt/miniconda3/bin:${process.env.PATH}`,
                    CONDA_PREFIX: '/opt/miniconda3',
                    // 添加 conda 激活脚本
                    CONDA_DEFAULT_ENV: 'base'
                },
                // 添加详细的错误信息
                stdio: ['inherit', 'pipe', 'pipe']
            });

            // 等待服务启动
            let isStarted = false;
            const startTimeout = setTimeout(() => {
                if (!isStarted) {
                    console.log('[OpenWebUI] Service startup timeout');
                    new Notice('OpenWebUI 服务启动超时，请检查日志');
                }
            }, 10000);

            this.process.stdout?.on('data', (data) => {
                const output = data.toString();
                console.log(`[OpenWebUI] stdout: ${output}`);
                if (output.includes('Application startup complete')) {
                    isStarted = true;
                    clearTimeout(startTimeout);
                    new Notice('OpenWebUI 服务已启动');
                }
            });

            this.process.stderr?.on('data', (data) => {
                const error = data.toString();
                console.error(`[OpenWebUI] stderr: ${error}`);
                // 如果是权限错误，给出具体提示
                if (error.includes('permission denied')) {
                    new Notice('OpenWebUI 启动失败：权限不足，请检查 conda 环境权限');
                }
            });

            this.process.on('error', (err) => {
                clearTimeout(startTimeout);
                const errorMessage = `启动失败: ${err.message}\n详细信息: ${err.stack || '无堆栈信息'}`;
                new Notice(`OpenWebUI ${errorMessage}`);
                console.error('[OpenWebUI] Failed to start:', errorMessage);
                this.process = null;
            });

            this.process.on('exit', (code, signal) => {
                clearTimeout(startTimeout);
                const exitInfo = `进程退出 - 代码: ${code}, 信号: ${signal}`;
                if (code !== 0) {
                    new Notice(`OpenWebUI ${exitInfo}`);
                }
                console.log(`[OpenWebUI] ${exitInfo}`);
                this.process = null;
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? 
                `${error.message}\n${error.stack || ''}` : 
                String(error);
            new Notice(`启动 OpenWebUI 失败: ${errorMessage}`);
            console.error('[OpenWebUI] Failed to start:', errorMessage);
            this.process = null;
        }
    }

    async stop(): Promise<void> {
        if (!this.process || typeof this.process.pid !== 'number') {
            return;
        }

        try {
            console.log('[OpenWebUI] Stopping service...');
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
            } else {
                // 首先尝试优雅地停止
                this.process.kill('SIGTERM');
                
                // 等待一段时间后强制终止
                setTimeout(() => {
                    try {
                        // 使用 pkill 确保所有相关进程都被终止
                        spawn('pkill', ['-9', '-f', 'open-webui serve']);
                    } catch (e) {
                        console.error('[OpenWebUI] Error during force kill:', e);
                    }
                }, 5000);
            }

            this.process = null;
            new Notice('OpenWebUI 服务已停止');
        } catch (error) {
            const errorMessage = error instanceof Error ? 
                `${error.message}\n${error.stack || ''}` : 
                String(error);
            new Notice(`停止 OpenWebUI 失败: ${errorMessage}`);
            console.error('[OpenWebUI] Failed to stop:', errorMessage);
        }
    }

    isRunning(): boolean {
        return this.process !== null;
    }
} 