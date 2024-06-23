import { ClassRepository } from "../data/ClassRepository.js";
import { Database } from "../data/Db.js";
import { Class, ClassCreationType, ClassUpdateType } from "../domain/Class.js";
import { Student } from "../domain/Student.js";
import { Teacher } from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/Conflict.js";
import { DependencyConflictError } from "../domain/errors/DependecyConflict.js";
import { MissingDependencyError } from "../domain/errors/MissingDependency.js";
import { NotFoundError } from "../domain/errors/NotFound.js";
import { Service } from "./BaseService.js";
import { StudentService } from "./StudentService.js";
import { TeacherService } from "./TeacherService.js";

export class ClassService extends Service<typeof Class> {
  constructor(
    repository: Database<typeof Class>,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService
  ) {
    super(repository);
  }

  #assertTeacherExists(teacherId?: string | null) {
    if (teacherId) {
      this.teacherService.findById(teacherId);
    }
  }
  update(id: string, newData: ClassUpdateType) {
    const entity = this.findById(id);
    this.#assertTeacherExists(newData.teacher);

    const updated = new Class({
      ...entity.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: ClassCreationType) {
    const entity = this.repository.listBy("code", creationData.code);

    if (entity.length > 0) {
      throw new ConflictError(creationData.code, Class);
    }

    this.#assertTeacherExists(creationData.teacher);

    const newEntity = new Class(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }

  remove(classId: string) {
    const students = this.studentService.listBy("class", classId);

    if (students.length > 0) {
      throw new DependencyConflictError(Teacher, Student, classId);
    }

    this.repository.remove(classId);
  }

  getTeacher(classId: string) {
    const classEntity = this.findById(classId);

    if (!classEntity.teacher) {
      throw new MissingDependencyError(Teacher, classId, Class);
    }

    return this.teacherService.findById(classEntity.teacher);
  }

  getStudents(classId: string) {
    const classEntity = this.findById(classId);

    return this.studentService.listBy("class", classEntity.id);
  }
}
