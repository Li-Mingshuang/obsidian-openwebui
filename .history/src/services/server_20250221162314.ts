import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class ServerManager {
    private process: ChildProcess | null = null;

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            // 使用 which 命令查找 open-webui 的路径
            const whichProcess = spawn('which', ['open-webui'], { shell: true });
            let openWebuiPath = '';
            
            whichProcess.stdout.on('data', (data) => {
                openWebuiPath = data.toString().trim();
            });

            await new Promise((resolve) => whichProcess.on('close', resolve));

            if (!openWebuiPath) {
                console.log('[OpenWebUI] Trying to find open-webui in common locations...');
                // 尝试常见的安装位置
                const commonPaths = [
                    '/usr/local/bin/open-webui',
                    '/opt/homebrew/bin/open-webui',
                    '/usr/bin/open-webui',
                    process.env.HOME + '/.local/bin/open-webui'
                ];

                for (const path of commonPaths) {
                    try {
                        await new Promise((resolve, reject) => {
                            const testProcess = spawn('test', ['-f', path]);
                            testProcess.on('close', (code) => {
                                if (code === 0) {
                                    openWebuiPath = path;
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            });
                        });
                        if (openWebuiPath) break;
                    } catch (e) {
                        console.log(`[OpenWebUI] Error checking path ${path}:`, e);
                    }
                }
            }

            if (!openWebuiPath) {
                throw new Error('找不到 open-webui 命令。请确保已安装 OpenWebUI 并添加到系统路径中。');
            }

            console.log(`[OpenWebUI] Found open-webui at: ${openWebuiPath}`);

            // 启动服务
            this.process = spawn(openWebuiPath, ['serve'], {
                shell: true,
                env: {
                    ...process.env,
                    PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin:${process.env.HOME}/.local/bin`
                }
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