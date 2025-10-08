import { getRepository } from "../entity/typeorm-config";
import { SnapshotEntity } from "../entity/typeorm-entities";
import { TechDesignSnapshotDsl } from "../../../shared/contract";
import { EmptyDesignDsl } from "../../../shared/sample/EmptyDesignDsl";

export class SnapshotService {
  private static snapshotRepository = getRepository(SnapshotEntity);

  public static async getDslBySnapshotId(snapshotId: number): Promise<TechDesignSnapshotDsl | null> {
    let dslStateInDb = await this.snapshotRepository.findOne({
      where: {
        id: snapshotId,
      },
    });

    let dslStateObj = null;
    if (!dslStateInDb || !dslStateInDb.dsl) {
      dslStateObj = JSON.parse(JSON.stringify(EmptyDesignDsl));
    } else {
      dslStateObj = JSON.parse(dslStateInDb.dsl);
    }
    return dslStateObj;
  }

  public static async createSnapshot(projectKey: string, dsl: TechDesignSnapshotDsl): Promise<number> {
    let newSnapshotData = this.snapshotRepository.create({
      projectKey: projectKey,
      dsl: JSON.stringify(dsl),
    });
    let newSnapshot = await this.snapshotRepository.save(newSnapshotData);
    return newSnapshot.id;
  }
}