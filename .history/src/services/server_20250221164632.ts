import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';
import type { OpenWebUISettings } from '../types';

export class ServerManager {
    private process: ChildProcess | null = null;
    private settings: OpenWebUISettings;

    constructor(settings: OpenWebUISettings) {
        this.settings = settings;
    }

    private async isPortInUse(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const netstat = spawn('lsof', ['-i', `:${port}`]);
            let output = '';
            
            netstat.stdout.on('data', (data) => {
                output += data.toString();
            });

            netstat.on('close', (code) => {
                resolve(output.length > 0);
            });
        });
    }

    private async killExistingProcess(): Promise<void> {
        return new Promise((resolve) => {
            // 使用更强力的方式终止进程
            const commands = [
                'pkill -f "open-webui serve"',
                'lsof -ti:8080 | xargs kill -9',  // 强制终止占用 8080 端口的进程
            ];
            
            const killAll = spawn('sh', ['-c', commands.join(' && ')]);
            
            killAll.on('close', () => {
                // 等待更长时间确保进程完全终止
                setTimeout(resolve, 3000);
            });
        });
    }

    private async ensurePortAvailable(port: number, retries = 3): Promise<boolean> {
        for (let i = 0; i < retries; i++) {
            const portInUse = await this.isPortInUse(port);
            if (!portInUse) {
                return true;
            }
            console.log(`[OpenWebUI] Port ${port} is in use, attempt ${i + 1} of ${retries} to free it...`);
            await this.killExistingProcess();
            // 等待端口释放
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return false;
    }

    async start(): Promise<void> {
        if (this.process) {
            return;
        }

        try {
            // 确保端口可用
            const portAvailable = await this.ensurePortAvailable(this.settings.serverPort);
            if (!portAvailable) {
                throw new Error('无法释放 8080 端口，请检查是否有其他程序占用');
            }

            console.log('[OpenWebUI] Starting service...');
            
            // 创建配置目录
            const homeDir = process.env.HOME || process.env.USERPROFILE;
            const configDir = `${homeDir}/Library/Application Support/open-webui`;
            const secretKeyPath = `${configDir}/.webui_secret_key`;
            
            // 确保配置目录存在
            const mkdirp = spawn('mkdir', ['-p', configDir]);
            await new Promise((resolve) => mkdirp.on('close', resolve));

            // 生成并写入密钥（如果不存在）
            const secretKey = Buffer.from(Math.random().toString(36) + Date.now().toString()).toString('base64');
            const writeKey = spawn('sh', ['-c', `echo "${secretKey}" > "${secretKeyPath}"`]);
            await new Promise((resolve) => writeKey.on('close', resolve));
            
            // 使用 conda run 来确保在正确的环境中运行
            const command = 'conda';
            const args = ['run', '-n', 'base', 'open-webui', 'serve', 
                '--port', this.settings.serverPort.toString(),
                '--host', '127.0.0.1'  // 只监听本地地址
            ];
            
            console.log(`[OpenWebUI] Running command: ${command} ${args.join(' ')}`);
            console.log(`[OpenWebUI] Using config directory: ${configDir}`);

            // 启动服务
            this.process = spawn(command, args, {
                shell: true,
                env: {
                    ...process.env,
                    HOME: homeDir,
                    WEBUI_CONFIG_DIR: configDir,
                    WEBUI_SECRET_KEY: secretKey,  // 直接传递密钥内容
                    PATH: `/opt/miniconda3/bin:${process.env.PATH}`,
                    CONDA_PREFIX: '/opt/miniconda3',
                    CONDA_DEFAULT_ENV: 'base',
                    TMPDIR: '/tmp'
                },
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
                // 检查端口占用错误
                if (output.includes('address already in use')) {
                    console.log('[OpenWebUI] Port is already in use, will try to restart...');
                    this.stop().then(() => this.start());
                }
            });

            this.process.stderr?.on('data', (data) => {
                const error = data.toString();
                console.error(`[OpenWebUI] stderr: ${error}`);
                if (error.includes('address already in use')) {
                    console.log('[OpenWebUI] Port is already in use, will try to restart...');
                    this.stop().then(() => this.start());
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
            
            // 首先尝试优雅地停止
            this.process.kill('SIGTERM');
            
            // 确保所有相关进程都被终止
            await this.killExistingProcess();

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