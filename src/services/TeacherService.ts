import {
  Teacher,
  TeacherCreationType,
  TeacherUpdateType,
} from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { Service } from "./BaseService.js";

export class TeacherService extends Service {
  update(id: string, newData: TeacherUpdateType) {
    const existing = this.findById(id) as Teacher;

    const updated = new Teacher({
      ...existing.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: TeacherCreationType) {
    const existing = this.repository.listBy("document", creationData.document);

    if (existing.length > 0) {
      throw new ConflictError(creationData.document, Teacher);
    }

    const newEntity = new Teacher(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }
}
