import { randomUUID } from "crypto";
import { z } from "zod";

import { Serializable } from "./types.js";

export const ClassCreationSchema = z.object({
  id: z.string().uuid().optional(),
  teacher: z.string().uuid().nullable(),
  code: z.string().regex(/^[0-9]{1}[A-H]{1}-[MTN]$/),
});

export const ClassUpdateSchema = ClassCreationSchema.partial().omit({
  id: true,
});

export type ClassCreationType = z.infer<typeof ClassCreationSchema>;
export type ClassUpdateType = z.infer<typeof ClassUpdateSchema>;

export class Class implements Serializable {
  code: ClassCreationType["code"];
  accessor teacher: ClassCreationType["teacher"];
  readonly id: string;

  constructor(data: ClassCreationType) {
    const parsedData = ClassCreationSchema.parse(data);

    this.id = parsedData.id ?? randomUUID();
    this.code = parsedData.code;
    this.teacher = parsedData.teacher;
  }

  static fromObject(data: Record<string, unknown>) {
    return new Class(ClassCreationSchema.parse(data));
  }

  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  toObject() {
    return {
      id: this.id,
      code: this.code,
      teacher: this.teacher,
    };
  }
}
