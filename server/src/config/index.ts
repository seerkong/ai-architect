import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  node_env: string;
}

export interface CorsConfig {
  origin: string;
}

export interface AiProviderConfig {
  provider: 'claude' | 'openai';
}

export interface ClaudeConfig {
  base_url: string;
  api_key: string;
  tech_doc_gen_model: string;
}

export interface OpenaiConfig {
  base_url: string;
  api_key: string;
  tech_doc_gen_model: string;
}

export interface ImageRecognitionConfig {
  api_key: string;
  model: string;
}

export interface DocsApiConfig {
  base_url: string;
  app_key: string;
  secret_key: string;
}

export interface AppConfig {
  server: ServerConfig;
  cors: CorsConfig;
  database: DatabaseConfig;
  ai_provider: AiProviderConfig;
  claude: ClaudeConfig;
  openai: OpenaiConfig;
  image_recognition: ImageRecognitionConfig;
  docs_api: DocsApiConfig;
}

class ConfigManager {
  private static instance: ConfigManager;
  private config!: AppConfig;

  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): void {
    try {
      // 根据环境选择配置文件
      let configPath: string;
      
      if (process.env.CONFIG_PATH) {
        // 优先使用环境变量指定的配置文件
        configPath = process.env.CONFIG_PATH;
      } else {
        // 根据NODE_ENV选择配置文件
        const nodeEnv = process.env.NODE_ENV || 'development';
        if (nodeEnv === 'production') {
          configPath = path.join(__dirname, '../../config.toml');
        } else {
          // 开发环境优先使用config.dev.toml，如果不存在则使用config.toml
          const devConfigPath = path.join(__dirname, '../../config.dev.toml');
          if (fs.existsSync(devConfigPath)) {
            configPath = devConfigPath;
          } else {
            configPath = path.join(__dirname, '../../config.toml');
          }
        }
      }
      
      // 检查配置文件是否存在
      if (!fs.existsSync(configPath)) {
        throw new Error(`配置文件不存在: ${configPath}`);
      }

      // 读取并解析TOML文件
      const configContent = fs.readFileSync(configPath, 'utf-8');
      this.config = toml.parse(configContent) as AppConfig;

      // 验证必需的配置项
      this.validateConfig();

      console.log(`✅ 配置文件加载成功: ${configPath}`);
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error);
      throw error;
    }
  }

  private validateConfig(): void {
    const requiredFields = [
      'server.port',
      'server.host',
      'database.host',
      'database.port',
      'database.database',
      'database.username',
      'database.password',
      'database.dialect',
      'docs_api.base_url',
      'docs_api.app_key',
      'docs_api.secret_key'
    ];

    for (const field of requiredFields) {
      const value = this.getNestedValue(this.config, field);
      if (value === undefined || value === null || value === '') {
        throw new Error(`必需的配置项缺失: ${field}`);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  public getServerConfig(): ServerConfig {
    return this.config.server;
  }

  public getCorsConfig(): CorsConfig {
    return this.config.cors;
  }

  public getAiProviderConfig(): AiProviderConfig {
    return this.config.ai_provider;
  }

  public getClaudeConfig(): ClaudeConfig {
    return this.config.claude;
  }

  public getOpenaiConfig(): OpenaiConfig {
    return this.config.openai;
  }

  public getImageRecognitionConfig(): ImageRecognitionConfig {
    return this.config.image_recognition;
  }

  public getDocsApiConfig(): DocsApiConfig {
    return this.config.docs_api;
  }

  // 重新加载配置（用于开发环境）
  public reloadConfig(): void {
    this.loadConfig();
  }
}

export const configManager = ConfigManager.getInstance();
export default configManager;
