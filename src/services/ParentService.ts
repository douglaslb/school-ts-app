import { ParentRepository } from "../data/ParentRepository.js";
import {
  Parent,
  ParentCreationType,
  ParentUpdateType,
} from "../domain/Parent.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { NotFoundError } from "../domain/errors/NotFoundError.js";

export class ParentService {
  constructor(private readonly repository: ParentRepository) {}

  list() {
    return this.repository.list();
  }

  remove(id: string) {
    this.repository.remove(id);
  }

  listBy(property: string, value: any) {
    return this.repository.listBy(property, value);
  }

  findById(id: string) {
    const entity = this.repository.findById(id);

    if (!entity) {
      throw new NotFoundError(id, this.repository.dbEntity);
    }

    return entity;
  }

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
