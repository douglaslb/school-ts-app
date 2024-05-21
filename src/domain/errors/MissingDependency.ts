import { SerializableStatic } from "../types.js";
import { DomainError } from "./DomainError.js";

export class MissingDependencyError extends DomainError {
  constructor(
    searched: SerializableStatic,
    locator: any,
    dependent: SerializableStatic
  ) {
    super(
      `${searched.name} with locator ${JSON.stringify(
        locator
      )} could not be found in ${dependent.name}.`,
      searched,
      { code: "MISSING_DEPENDENCY", status: 404 }
    );
  }
}
