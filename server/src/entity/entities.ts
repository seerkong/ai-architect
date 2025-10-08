import { DataTypes, Sequelize } from 'sequelize';
import { configManager } from '../config';
import { ProjectStatus } from '../../../shared/contract';

// 从配置文件获取数据库配置
const dbConfig = configManager.getDatabaseConfig();

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect as any
  }
);


// dsl快照
export const SnapshotEntity = sequelize.define(
  'ai_web_architect_snapshot',
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    projectKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dsl: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
  tableName: 'ai_web_architect_snapshot',
  underscored: true,
  timestamps: false
});

export const ProjectEntity = sequelize.define(
  'ai_web_architect_project',
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    // 每个project的key是唯一的
    projectKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 项目状态
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ProjectStatus.Init
    },
    dslSnapshotId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: false
    },
    // 原始PRD内容
    sourcePrdContent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 变化后后PRD内容
    transformedPrdContent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 原始技术约束内容
    sourceTechConstraintsContent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
  tableName: 'ai_web_architect_project',
  underscored: true,
  timestamps: false
});

// 一个项目有多个会话
export const ConversationEntity = sequelize.define(
  'ai_web_architect_conversation',
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dslSnapshotBeforeId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: false
    },
    dslSnapshotAfterId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: false
    },
    dslMutationFinal: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
  tableName: 'ai_web_architect_conversation',
  underscored: true,
  timestamps: false
});

// 对话消息
export const MessageEntity = sequelize.define(
  'ai_web_architect_message',
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    // prevMsgUniqueId: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    projectKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    conversationUniqueId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dslSnapshotBeforeId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: false
    },
    dslSnapshotAfterId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      primaryKey: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dslMutation: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
  tableName: 'ai_web_architect_message',
  underscored: true,
  timestamps: false
});

