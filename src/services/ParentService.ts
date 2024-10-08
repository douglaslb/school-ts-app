import {
  Parent,
  ParentCreationType,
  ParentUpdateType,
} from "../domain/Parent.js";
import { ConflictError } from "../domain/errors/Conflict.js";
import { Service } from "./BaseService.js";

export class ParentService extends Service<typeof Parent> {
  update(id: string, newData: ParentUpdateType) {
    const entity = this.findById(id);

    const updated = new Parent({
      ...entity.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: ParentCreationType) {
    const parentEntity = this.repository.listBy(
      "document",
      creationData.document
    );

    if (parentEntity.length > 0) {
      throw new ConflictError(creationData.document, this.repository.dbEntity);
    }

    const newEntity = new Parent(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }
}
