import { SerializableStatic } from "../types.js";
import { DomainError } from "./DomainError.js";

export class DependencyConflictError extends DomainError {
  constructor(
    parentClass: SerializableStatic,
    dependency: SerializableStatic,
    locator: any
  ) {
    super(
      `${parentClass.name} with locator ${JSON.stringify(
        locator
      )} cannot be removed because ${dependency.name} depends on it.`,
      dependency,
      { code: "DEPENDENCY_LOCK", status: 403 }
    );
  }
}
