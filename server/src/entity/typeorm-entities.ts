import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// 项目状态枚举
export enum ProjectStatus {
  Init = 'Init',
  PRDTransformed = 'PRDTransformed',
  ModuleInitialized = 'ModuleInitialized',
}

// DSL快照实体
@Entity('ai_web_architect_snapshot')
export class SnapshotEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '项目标识' })
  projectKey: string;

  @Column({ type: 'longtext', nullable: false, comment: 'DSL内容' })
  dsl: string;
}

// 项目实体
@Entity('ai_web_architect_project')
@Index(['projectKey'], { unique: true })
export class ProjectEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true, comment: '项目唯一标识' })
  projectKey: string;

  @Column({ 
    type: 'enum', 
    enum: ProjectStatus, 
    default: ProjectStatus.Init,
    nullable: false,
    comment: '项目状态'
  })
  status: ProjectStatus;

  @Column({ type: 'bigint', nullable: true, comment: 'DSL快照ID' })
  dslSnapshotId: number | null;

  @Column({ type: 'text', nullable: true, comment: '原始PRD内容' })
  sourcePrdContent: string | null;

  @Column({ type: 'text', nullable: true, comment: '转换后的PRD内容' })
  transformedPrdContent: string | null;

  @Column({ type: 'text', nullable: true, comment: '原始技术约束内容' })
  sourceTechConstraintsContent: string | null;


  // @CreateDateColumn({ comment: '创建时间' })
  // createdAt: Date;

  // @UpdateDateColumn({ comment: '更新时间' })
  // updatedAt: Date;
}

// 会话实体
@Entity('ai_web_architect_conversation')
@Index(['uniqueId'], { unique: true })
export class ConversationEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true, comment: '会话唯一标识' })
  uniqueId: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '项目标识' })
  projectKey: string;

  @Column({ type: 'bigint', nullable: true, comment: '变更前DSL快照ID' })
  dslSnapshotBeforeId: number | null;

  @Column({ type: 'bigint', nullable: true, comment: '变更后DSL快照ID' })
  dslSnapshotAfterId: number | null;

  @Column({ type: 'text', nullable: false, comment: '最终DSL变更' })
  dslMutationFinal: string;
}

// 消息实体
@Entity('ai_web_architect_message')
export class MessageEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '项目标识' })
  projectKey: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '会话唯一标识' })
  conversationUniqueId: string;

  @Column({ type: 'bigint', nullable: true, comment: '变更前DSL快照ID' })
  dslSnapshotBeforeId: number | null;

  @Column({ type: 'bigint', nullable: true, comment: '变更后DSL快照ID' })
  dslSnapshotAfterId: number | null;

  @Column({ type: 'boolean', default: false, comment: '是否删除' })
  deleted: boolean;

  @Column({ type: 'varchar', length: 50, nullable: false, comment: '消息角色' })
  role: string;

  @Column({ type: 'text', nullable: false, comment: '消息内容' })
  content: string;

  @Column({ type: 'text', nullable: false, comment: 'DSL变更' })
  dslMutation: string;
}

// 导出所有实体类
export const entities = [
  SnapshotEntity,
  ProjectEntity,
  ConversationEntity,
  MessageEntity,
];

// 导出类型定义 - 这些类型可以同时用于前端和后端
export type ProjectEntityType = ProjectEntity;
export type SnapshotEntityType = SnapshotEntity;
export type ConversationEntityType = ConversationEntity;
export type MessageEntityType = MessageEntity;
