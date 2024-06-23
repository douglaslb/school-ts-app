import { Student } from "../domain/Student.js";
import { Database } from "./Db.js";

/**
  Poderíamos fazer diretamente com a instância de Database, ex: new Database(Student), mas caso precisemos de métodos 
  específicos para Student, é melhor criar uma classe repository específica
 **/
export class StudentRepository extends Database<typeof Student> {
  constructor() {
    super(Student);
  }
}
