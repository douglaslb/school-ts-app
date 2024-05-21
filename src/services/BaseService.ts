import { Database } from "../data/Db.js";
import { NotFoundError } from "../domain/errors/NotFound.js";
import { Serializable } from "../domain/types.js";

export abstract class Service {
  constructor(protected readonly repository: Database) {}

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

  abstract update(id: string, newData: unknown): Serializable;

  abstract create(creationData: unknown): Serializable;
}
