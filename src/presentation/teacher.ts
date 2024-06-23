import { Router, type Request } from "express";
import {
  TeacherCreationSchema,
  TeacherCreationType,
  TeacherUpdateSchema,
} from "../domain/Teacher.js";
import { ClassService } from "../services/ClassService.js";
import { TeacherService } from "../services/TeacherService.js";
import zodValidationMiddleware from "./middlewares/zodValidationMiddleware.js";
import { StudentService } from "../services/StudentService.js";
import { Student } from "../domain/Student.js";

export function teacherRouterFactory(
  teacherService: TeacherService,
  classService: ClassService,
  studentService: StudentService
) {
  const router = Router();

  router.get("/", async (_, res) => {
    const teachers = teacherService.list().map((teacher) => teacher.toObject());

    return res.json(teachers);
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const teacher = teacherService.findById(req.params.id);

      return res.json(teacher.toObject());
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    zodValidationMiddleware(TeacherCreationSchema.omit({ id: true })),
    async (
      req: Request<never, any, Omit<TeacherCreationType, "id">>,
      res,
      next
    ) => {
      try {
        const { body } = req;

        const teacher = teacherService.create(body);

        return res.status(201).json(teacher.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    zodValidationMiddleware(TeacherUpdateSchema),
    async (req, res, next) => {
      try {
        const {
          body,
          params: { id },
        } = req;

        const updatedTeacher = teacherService.update(id, body);

        res.set({ Location: `${req.baseUrl}/${updatedTeacher.id}` });

        return res.json(updatedTeacher.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      const classes = classService.listBy("teacher", id);

      for (const classEntity of classes) {
        classService.update(classEntity.id, { teacher: null });
      }

      teacherService.remove(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/students", async (req, res, next) => {
    try {
      const { id } = req.params;
      teacherService.findById(id);

      const classes = classService.listBy("teacher", id);

      if (classes.length === 0) {
        return res.json([]);
      }

      let totalStudents: Student[] = [];

      for (const classEntity of classes) {
        const students = studentService.listBy("class", classEntity.id);
        totalStudents = [...totalStudents, ...students];
      }

      return res.json(totalStudents.map((student) => student.toObject()));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/classes", async (req, res, next) => {
    try {
      const { id } = req.params;
      teacherService.findById(id);

      const classes = classService.listBy("teacher", id);
      const classesToObject = classes.map((classEntity) =>
        classEntity.toObject()
      );

      return res.json(classesToObject);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
