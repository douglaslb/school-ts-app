import {
  Parent,
  ParentCreationType,
  ParentUpdateType,
} from "../domain/Parent.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { Service } from "./BaseService.js";

export class ParentService extends Service {
  update(id: string, newData: ParentUpdateType) {
    const existing = this.findById(id) as Parent;

    const updated = new Parent({
      ...existing.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: ParentCreationType) {
    const existing = this.repository.listBy("document", creationData.document);

    if (existing.length > 0) {
      throw new ConflictError(creationData.document, this.repository.dbEntity);
    }

    const newEntity = new Parent(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }
}
