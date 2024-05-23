import { Request, Router } from "express";
import {
  StudentCreationSchema,
  StudentCreationType,
  StudentUpdateSchema,
} from "../domain/Student.js";
import { StudentService } from "../services/StudentService.js";
import zodValidationMiddleware from "./middlewares/zodValidationMiddleware.js";

export function studentRouterFactory(studentService: StudentService) {
  const router = Router();

  router.get("/", async (_, res) => {
    const students = studentService.list().map((student) => student.toObject());

    return res.json(students);
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const student = studentService.findById(req.params.id);

      return res.json(student.toObject());
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    zodValidationMiddleware(StudentCreationSchema.omit({ id: true })),
    async (req, res, next) => {
      try {
        const { body } = req;

        const student = studentService.create(body);

        return res.status(201).json(student.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    zodValidationMiddleware(StudentUpdateSchema.omit({ parents: true })),
    async (req, res, next) => {
      try {
        const {
          body,
          params: { id },
        } = req;

        const updatedStudent = studentService.update(id, body);

        res.set({ Location: `${req.baseUrl}/${updatedStudent.id}` });

        return res.json(updatedStudent.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      studentService.remove(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/parents", async (req, res, next) => {
    try {
      const { id } = req.params;
      const parents = studentService.getParents(id);

      const parentsToObject = parents.map((student) => student.toObject());

      return res.json(parentsToObject);
    } catch (error) {
      next(error);
    }
  });

  router.patch(
    "/:id/parents",
    zodValidationMiddleware(StudentCreationSchema.pick({ parents: true })),
    async (
      req: Request<{ id: string }, any, Pick<StudentCreationType, "parents">>,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const { parents } = req.body;

        return res.json(studentService.linkParent(id, parents).toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
