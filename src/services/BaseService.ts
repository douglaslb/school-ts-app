import { Database } from "../data/Db.js";
import { NotFoundError } from "../domain/errors/NotFound.js";
import { Serializable, SerializableStatic } from "../domain/types.js";

export abstract class Service<
  Static extends SerializableStatic,
  Instance extends Serializable = InstanceType<Static>
> {
  constructor(protected readonly repository: Database<Static>) {}

  list() {
    return this.repository.list();
  }

  remove(id: string) {
    this.repository.remove(id);
  }

  listBy<Property extends keyof Instance>(
    property: Property,
    value: Instance[Property]
  ) {
    return this.repository.listBy(property, value);
  }

  findById(id: string) {
    const entity = this.repository.findById(id);

    if (!entity) {
      throw new NotFoundError(id, this.repository.dbEntity);
    }

    return entity;
  }

  abstract update(id: string, newData: unknown): Instance;

  abstract create(creationData: unknown): Instance;
}
