import { getRepository } from "../entity/typeorm-config";
import { ProjectEntity, SnapshotEntity, ProjectStatus } from "../entity/typeorm-entities";

import { EmptyDesignDsl } from "../../../shared/sample/EmptyDesignDsl";
import { ProjectDetailViewModel, ProjectEntityType } from "../../../shared/contract";

export class ProjectService {
  private static projectRepository = getRepository(ProjectEntity);
  private static snapshotRepository = getRepository(SnapshotEntity);

  public static async findOne(projectKey: string): Promise<ProjectEntityType | null> {
    return await this.projectRepository.findOne({
      where: {
        projectKey: projectKey
      }
    }) as ProjectEntityType | null;
  }

  public static async upsert(projectKey: string) {
    let project = await this.projectRepository.findOne({
      where: {
        projectKey: projectKey
      }
    });
    let initDslData = JSON.stringify(EmptyDesignDsl);
    if (project) {
      // 项目已存在，不需要做任何操作
    } else {
      // 创建新的快照
      let newSnapshot = this.snapshotRepository.create({
        projectKey: projectKey,
        dsl: initDslData,
      });
      newSnapshot = await this.snapshotRepository.save(newSnapshot);
      
      // 创建新项目
      let newProjectData = this.projectRepository.create({
        projectKey: projectKey,
        status: ProjectStatus.Init,
        dslSnapshotId: newSnapshot.id,
      });
      project = await this.projectRepository.save(newProjectData);
    }

    return project;
  }

  public static async updateSnapshotId(project: ProjectEntityType, dslSnapshotId: number) {
    await this.projectRepository.update(project.id, {
      dslSnapshotId: dslSnapshotId,
    });
  }

  public static async updateStatus(project: ProjectEntityType, status: ProjectStatus) {
    await this.projectRepository.update(project.id, {
      status: status,
    });
  }

  public static async updateProjectContent(project: ProjectEntityType, updates: {
    status?: ProjectStatus;
    sourcePrdContent?: string;
    transformedPrdContent?: string;
    sourceTechConstraintsContent?: string;
  }) {
    await this.projectRepository.update(project.id, updates);
  }

  public static async detail(projectKey: string): Promise<ProjectEntityType | null> {
    let project = await this.projectRepository.findOne({
      where: {
        projectKey: projectKey
      }
    }) as ProjectEntityType | null;
    if (!project) {
      return null;
    }
    return project;
  }

  public static async makeDetailVo(project: ProjectEntityType): Promise<ProjectDetailViewModel> {
    let projectLatest = await this.detail(project.projectKey);
    if (!projectLatest) {
      return null as unknown as ProjectDetailViewModel;
    }
    let dslSnapshotRecord = await this.snapshotRepository.findOne({
      where: {
        projectKey: projectLatest.projectKey,
        id: projectLatest.dslSnapshotId,
      }
    });
    let dslSnapshotObj = EmptyDesignDsl;
    if (dslSnapshotRecord) {
      dslSnapshotObj = JSON.parse(dslSnapshotRecord?.dsl || '{}');
    }
    return {
      id: projectLatest.id,
      projectKey: projectLatest.projectKey,
      status: projectLatest.status,
      dslSnapshot: dslSnapshotObj,
      sourcePrdContent: projectLatest.sourcePrdContent || '',
      transformedPrdContent: projectLatest.transformedPrdContent || '',
      sourceTechConstraintsContent: projectLatest.sourceTechConstraintsContent || '',
    }
  }
}