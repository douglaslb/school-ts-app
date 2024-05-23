import { type Request, Router } from "express";
import {
  ClassCreationSchema,
  ClassCreationType,
  ClassUpdateSchema,
} from "../domain/Class.js";
import { ClassService } from "../services/ClassService.js";
import zodValidationMiddleware from "./middlewares/zodValidationMiddleware.js";

export function classRouterFactory(classService: ClassService) {
  const router = Router();

  router.get("/", async (_, res) => {
    const classes = classService
      .list()
      .map((classEntity) => classEntity.toObject());

    return res.json(classes);
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const classEntity = classService.findById(req.params.id);

      return res.json(classEntity.toObject());
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    zodValidationMiddleware(ClassCreationSchema.omit({ id: true })),
    async (
      req: Request<never, any, Omit<ClassCreationType, "id">>,
      res,
      next
    ) => {
      try {
        const { body } = req;

        const classEntity = classService.create(body);

        return res.status(201).json(classEntity.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    zodValidationMiddleware(ClassUpdateSchema),
    async (req, res, next) => {
      try {
        const {
          body,
          params: { id },
        } = req;

        const updatedClass = classService.update(id, body);

        res.set({ Location: `${req.baseUrl}/${updatedClass.id}` });

        return res.json(updatedClass.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      classService.remove(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/students", async (req, res, next) => {
    try {
      const { id } = req.params;

      const students = classService.getStudents(id);

      const studentsToObject = students.map((student) => student.toObject());

      return res.json(studentsToObject);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/teacher", async (req, res, next) => {
    try {
      const { id } = req.params;

      const teacher = classService.getTeacher(id);

      return res.json(teacher.toObject());
    } catch (error) {
      next(error);
    }
  });

  return router;
}
