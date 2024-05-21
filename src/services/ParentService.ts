import {
  Parent,
  ParentCreationType,
  ParentUpdateType,
} from "../domain/Parent.js";
import { ConflictError } from "../domain/errors/Conflict.js";
import { Service } from "./BaseService.js";

export class ParentService extends Service {
  update(id: string, newData: ParentUpdateType) {
    const entity = this.findById(id) as Parent;

    const updated = new Parent({
      ...entity.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: ParentCreationType) {
    const entity = this.repository.listBy("document", creationData.document);

    if (entity.length > 0) {
      throw new ConflictError(creationData.document, this.repository.dbEntity);
    }

    const newEntity = new Parent(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }
}
