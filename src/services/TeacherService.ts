import {
  Teacher,
  TeacherCreationType,
  TeacherUpdateType,
} from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/Conflict.js";
import { Service } from "./BaseService.js";

export class TeacherService extends Service {
  update(id: string, newData: TeacherUpdateType) {
    const entity = this.findById(id) as Teacher;

    const updated = new Teacher({
      ...entity.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: TeacherCreationType) {
    const entity = this.repository.listBy("document", creationData.document);

    if (entity.length > 0) {
      throw new ConflictError(creationData.document, Teacher);
    }

    const newEntity = new Teacher(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }
}
