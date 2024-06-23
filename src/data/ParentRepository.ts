import { Parent } from "../domain/Parent.js";
import { Database } from "./Db.js";

export class ParentRepository extends Database<typeof Parent> {
  constructor() {
    super(Parent);
  }
}
