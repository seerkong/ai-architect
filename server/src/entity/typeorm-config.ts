import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { entities } from './typeorm-entities';
import { configManager } from '../config';

// 从配置文件获取数据库配置
const dbConfig = configManager.getDatabaseConfig();

// 创建数据源
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: entities,
  synchronize: false, // 禁用自动同步，因为数据库已存在
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  namingStrategy: new SnakeNamingStrategy()
});

// 初始化数据库连接
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('TypeORM 数据库连接已建立');
    }
  } catch (error) {
    console.error('TypeORM 数据库连接失败:', error);
    throw error;
  }
}

// 关闭数据库连接
export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('TypeORM 数据库连接已关闭');
  }
}

// 获取实体仓库的辅助函数
export function getRepository<T>(entity: new () => T) {
  return AppDataSource.getRepository(entity);
}
