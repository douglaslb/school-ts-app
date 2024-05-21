import { StudentRepository } from "../data/StudentRepository.js";
import { Parent } from "../domain/Parent.js";
import {
  Student,
  StudentCreationType,
  StudentUpdateType,
} from "../domain/Student.js";
import { ConflictError } from "../domain/errors/Conflict.js";
import { EmptyDependencyError } from "../domain/errors/EmptyDependency.js";
import { Serializable } from "../domain/types.js";
import { Service } from "./BaseService.js";
import { ParentService } from "./ParentService.js";

export class StudentService extends Service {
  constructor(
    repository: StudentRepository,
    private readonly parentService: ParentService
  ) {
    super(repository);
  }

  update(id: string, newData: StudentUpdateType) {
    const entity = this.findById(id) as Student;

    const updated = new Student({
      ...entity.toObject(),
      ...newData,
    });

    this.repository.save(updated);
    return updated;
  }

  create(creationData: StudentCreationType): Serializable {
    const entity = this.repository.listBy("document", creationData.document);

    if (entity.length > 0) {
      throw new ConflictError(creationData.document, Student);
    }

    creationData.parents.forEach((parent) =>
      this.parentService.findById(parent)
    );

    const newEntity = new Student(creationData);
    this.repository.save(newEntity);
    return newEntity;
  }

  getParents(studentId: string) {
    const student = this.findById(studentId) as Student;
    return student.parents.map((parentId) =>
      this.parentService.findById(parentId)
    ) as Parent[];
  }

  linkParent(
    studentId: string,
    parentsToUpdate: StudentCreationType["parents"]
  ) {
    const student = this.findById(studentId) as Student;

    parentsToUpdate.forEach((parentId) => {
      this.parentService.findById(parentId);
    });

    const newParents: string[] = parentsToUpdate.filter(
      (parentId) => !student.parents.includes(parentId)
    );

    this.#assertAtLeastOneParentLeft(newParents);

    student.parents = [...student.parents, ...newParents];

    this.repository.save(student);
    return student;
  }

  #assertAtLeastOneParentLeft(
    parentArray: unknown[]
  ): asserts parentArray is [string, ...string[]] {
    if (parentArray.length === 0) {
      throw new EmptyDependencyError(Student, Parent);
    }
  }
}
