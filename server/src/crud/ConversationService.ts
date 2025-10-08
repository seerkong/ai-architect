import { v4 as uuidv4 } from 'uuid';
import { getRepository } from "../entity/typeorm-config";
import { ConversationEntity, MessageEntity, SnapshotEntity, ConversationEntityType, MessageEntityType, SnapshotEntityType } from "../entity/typeorm-entities";
import { ProjectEntityType } from '@shared/contract';

export interface ConversationAndMsgResult {
  conversationUniqueId: string;
  conversationBeforeSnapshotId: number;
  conversationAfterSnapshotId: number;
  questionMessageId: number;
  answerMessageId: number;
}

export class ConversationService {
  private static conversationRepository = getRepository(ConversationEntity);
  private static messageRepository = getRepository(MessageEntity);
  private static snapshotRepository = getRepository(SnapshotEntity);
  public static async findOneByUniqueId(uniqueId: string): Promise<ConversationEntityType | null> {
    return await this.conversationRepository.findOne({
      where: {
        uniqueId: uniqueId,
      },
    }) as ConversationEntityType | null;
  }

  public static async updateAfterSnapshotId(uniqueId: string, afterSnapshotId: number): Promise<void> {
    await this.conversationRepository.update({
      dslSnapshotAfterId: afterSnapshotId,
    }, {
      uniqueId: uniqueId,
    });
  }

  public static async createInitModuleConversationAndMsg(
    project: ProjectEntityType
  ): Promise<ConversationAndMsgResult> {
    let conversation = this.conversationRepository.create({
      projectKey: project.projectKey,
      dslSnapshotBeforeId: project.dslSnapshotId,
      dslSnapshotAfterId: project.dslSnapshotId,
      dslMutationFinal: '{}',
      uniqueId: uuidv4(),
    });
    conversation = await this.conversationRepository.save(conversation) as ConversationEntityType;

    let answerMessageRecord = this.messageRepository.create({
      projectKey: project.projectKey,
      conversationUniqueId: conversation.uniqueId,
      role: 'assistant',
      content: '',
      dslSnapshotBeforeId: project.dslSnapshotId,
      dslSnapshotAfterId: project.dslSnapshotId,
      dslMutation: '{}',
    });
    answerMessageRecord = await this.messageRepository.save(answerMessageRecord);

    return {
      conversationUniqueId: conversation.uniqueId,
      conversationBeforeSnapshotId: project.dslSnapshotId || 0,
      conversationAfterSnapshotId: project.dslSnapshotId || 0,
      questionMessageId: 0, // 初始化对话没有用户问题
      answerMessageId: answerMessageRecord.id || 0
    };
  }

  public static async createOrUpdateConversationAndMsg(
    project: ProjectEntityType,
    userCommand: string,
    conversationUniqueId?: string,
  ): Promise<ConversationAndMsgResult> {
    let conversation: ConversationEntityType | null = null;
    if (conversationUniqueId) {
      let conversationOld = await this.conversationRepository.findOne({
        where: {
          uniqueId: conversationUniqueId,
        },
      });
      if (conversationOld) {
        conversation = conversationOld as ConversationEntityType;
      }
    }
    if (!conversation) {
      let conversationNew = this.conversationRepository.create({
        projectKey: project.projectKey,
        dslSnapshotBeforeId: project.dslSnapshotId,
        dslSnapshotAfterId: project.dslSnapshotId,
        dslMutationFinal: '{}',
        uniqueId: uuidv4(),
      });
      conversation = await this.conversationRepository.save(conversationNew) as ConversationEntityType;
    }

    // 确保 conversation 不为 null
    if (!conversation) {
      throw new Error('Failed to create or find conversation');
    }

    let questionMessageRecord = this.messageRepository.create({
      projectKey: project.projectKey,
      conversationUniqueId: conversation.uniqueId,
      role: 'user',
      content: userCommand,
      dslSnapshotBeforeId: conversation.dslSnapshotAfterId,
      dslSnapshotAfterId: conversation.dslSnapshotAfterId,
      dslMutation: '{}',
    });
    questionMessageRecord = await this.messageRepository.save(questionMessageRecord);

    let answerMessageRecord = this.messageRepository.create({
      projectKey: project.projectKey,
      conversationUniqueId: conversation.uniqueId,
      role: 'assistant',
      content: '',
      dslSnapshotBeforeId: conversation.dslSnapshotAfterId,
      dslSnapshotAfterId: conversation.dslSnapshotAfterId,
      dslMutation: '{}',
    });
    answerMessageRecord = await this.messageRepository.save(answerMessageRecord);

    return {
      conversationUniqueId: conversation.uniqueId,
      conversationBeforeSnapshotId: conversation.dslSnapshotBeforeId || 0,
      conversationAfterSnapshotId: conversation.dslSnapshotAfterId || 0,
      questionMessageId: questionMessageRecord.id || 0,
      answerMessageId: answerMessageRecord.id || 0,
    };
  }

  public static async listHistoryMessages(conversationUniqueId: string): Promise<MessageEntityType[]> {
    return await this.messageRepository.find({
      where: {
        conversationUniqueId: conversationUniqueId,
      },
      order: { id: 'ASC' },
    }) as MessageEntityType[];
  }

  // 返回最新的snapshot id
  public static async updateConversationAndMsgSnapshot(
    projectKey: string, conversationUniqueId: string,
    messageId: number, content: string, dslNew: any
  ): Promise<number> {
    let newSnapshotData = this.snapshotRepository.create({
      projectKey: projectKey,
      dsl: JSON.stringify(dslNew),
    });
    let newSnapshot = await this.snapshotRepository.save(newSnapshotData);
    let newSnapshotId = newSnapshot.id;

    await this.messageRepository.update(messageId, {
      content: content,
      dslSnapshotAfterId: newSnapshotId,
    });

    await this.conversationRepository.update({
      uniqueId: conversationUniqueId,
    }, {
      dslSnapshotAfterId: newSnapshotId,
    });

    return newSnapshotId;
  }

  public static async detail(conversationId: string): Promise<ConversationEntityType | null> {
    return await this.conversationRepository.findOne({
      where: {
        uniqueId: conversationId,
      },
    }) as ConversationEntityType | null;
  }

  public static async updateConversationBaseSnapshotId(conversationId: string, baseSnapshotId: number): Promise<void> {
    await this.conversationRepository.update({
      dslSnapshotBeforeId: baseSnapshotId,
    }, {
      uniqueId: conversationId,
    });
  }

  public static async getConversationBeforeDslSnapshot(conversationId: string): Promise<number> {
    let conversation = await this.conversationRepository.findOne({
      where: {
        uniqueId: conversationId,
      },
    });
    let beforeSnapshotId = conversation?.dslSnapshotBeforeId || 0;
    return beforeSnapshotId;
  }
}