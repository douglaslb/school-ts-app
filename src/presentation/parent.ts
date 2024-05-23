import { Router } from "express";
import { ParentCreationSchema, ParentUpdateSchema } from "../domain/Parent.js";
import { ParentService } from "../services/ParentService.js";
import { StudentService } from "../services/StudentService.js";
import zodValidationMiddleware from "./middlewares/zodValidationMiddleware.js";

export function parentRouterFactory(
  parentService: ParentService,
  studentService: StudentService
) {
  const router = Router();

  router.get("/", async (_, res) => {
    const parents = parentService.list().map((parent) => parent.toObject());

    return res.json(parents);
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const parent = parentService.findById(req.params.id);

      return res.json(parent.toObject());
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    zodValidationMiddleware(ParentCreationSchema),
    async (req, res, next) => {
      try {
        const { body } = req;

        const parent = parentService.create(body);

        return res.status(201).json(parent.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    zodValidationMiddleware(ParentUpdateSchema),
    async (req, res, next) => {
      try {
        const {
          body,
          params: { id },
        } = req;

        const updatedParent = parentService.update(id, body);

        res.set({ Location: `${req.baseUrl}/${updatedParent.id}` });

        return res.json(updatedParent.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const students = studentService.listBy("parents", [id]);

      if (students.length > 0) {
        return res.status(403).json({
          message: `Cannot delete parent id ${id} because it is linked to students`,
        });
      }

      parentService.remove(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/students", async (req, res, next) => {
    try {
      const { id } = req.params;
      const students = studentService.listBy("parents", [id]);

      const studentsToObject = students.map((student) => student.toObject());

      return res.json(studentsToObject);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
