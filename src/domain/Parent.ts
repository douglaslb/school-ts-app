import { randomUUID } from "crypto";
import { z } from "zod";

import { AddressSchema, Serializable } from "./types.js";

export const ParentCreationSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  phones: z.array(z.string()).nonempty(),
  emails: z.array(z.string().email()).nonempty(),
  address: z.array(AddressSchema).nonempty(),
  document: z.string(),
});

export type ParentCreationType = z.infer<typeof ParentCreationSchema>;

export class Parent implements Serializable {
  firstName: ParentCreationType["firstName"];
  surname: ParentCreationType["surname"];
  phones: ParentCreationType["phones"];
  emails: ParentCreationType["emails"];
  address: ParentCreationType["address"];
  document: ParentCreationType["document"];
  readonly id: string;

  constructor(data: ParentCreationType) {
    const parsedData = ParentCreationSchema.parse(data);

    this.id = parsedData.id ?? randomUUID();
    this.firstName = parsedData.firstName;
    this.surname = parsedData.surname;
    this.phones = parsedData.phones;
    this.emails = parsedData.emails;
    this.address = parsedData.address;
    this.document = parsedData.document;
  }

  fromObject(data: Record<string, unknown>) {
    return new Parent(ParentCreationSchema.parse(data));
  }

  static fromObject(data: Record<string, unknown>) {
    return new Parent(ParentCreationSchema.parse(data));
  }

  toObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      surname: this.surname,
      phones: this.phones,
      emails: this.emails,
      address: this.address,
      document: this.document,
    };
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
}
