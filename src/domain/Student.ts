import { randomUUID } from "crypto";
import { z } from "zod";

import { Serializable } from "./types.js";

export const StudentCreationSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  document: z.string(),
  bloodType: z.string(),
  birthDate: z
    .string()
    .datetime()
    .refine((date) => !isNaN(new Date(date).getTime())),
  allergies: z.string().array().optional(),
  medications: z.string().array().optional(),
  startDate: z
    .string()
    .datetime()
    .refine((date) => !isNaN(new Date(date).getTime())),
  parents: z.string().uuid().array().nonempty(),
  class: z.string().uuid(),
});

export const StudentUpdateSchema = StudentCreationSchema.partial().omit({
  id: true,
});

export type StudentCreationType = z.infer<typeof StudentCreationSchema>;
export type StudentUpdateType = z.infer<typeof StudentUpdateSchema>;

export class Student implements Serializable {
  readonly id: string;
  firstName: StudentCreationType["firstName"];
  surname: StudentCreationType["surname"];
  document: StudentCreationType["document"];
  bloodType: StudentCreationType["bloodType"];
  birthDate: Date;
  allergies?: string[];
  medications?: string[];
  startDate: Date;
  #parents: StudentCreationType["parents"];
  class: string;

  constructor(data: StudentCreationType) {
    const parsedData = StudentCreationSchema.parse(data);

    this.id = parsedData.id ?? randomUUID();
    this.firstName = parsedData.firstName;
    this.surname = parsedData.surname;
    this.document = parsedData.document;
    this.bloodType = parsedData.bloodType;
    this.birthDate = new Date(parsedData.birthDate);
    this.allergies = parsedData.allergies;
    this.medications = parsedData.medications;
    this.startDate = new Date(parsedData.startDate);
    this.#parents = parsedData.parents;
    this.class = parsedData.class;
  }

  get parents() {
    return this.#parents;
  }

  set parents(value) {
    this.#parents = value;
  }

  static fromObject(data: Record<string, unknown>) {
    return new Student(StudentCreationSchema.parse(data));
  }

  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  toObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      surname: this.surname,
      document: this.document,
      bloodType: this.bloodType,
      birthDate: this.birthDate.toISOString(),
      allergies: this.allergies,
      medications: this.medications,
      startDate: this.startDate.toISOString(),
      parents: this.#parents,
      class: this.class,
    };
  }
}
