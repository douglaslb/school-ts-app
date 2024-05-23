import { appConfig, type AppConfig } from "./config.js";
import { ClassRepository } from "./data/ClassRepository.js";
import { ParentRepository } from "./data/ParentRepository.js";
import { StudentRepository } from "./data/StudentRepository.js";
import { TeacherRepository } from "./data/TeacherRepository.js";
import { WebLayer } from "./presentation/index.js";
import { ClassService } from "./services/ClassService.js";
import { ParentService } from "./services/ParentService.js";
import { StudentService } from "./services/StudentService.js";
import { TeacherService } from "./services/TeacherService.js";

export type Application = (
  config: AppConfig,
  services: any
) => Promise<{
  start(): Promise<void>;
  stop(): Promise<void>;
}>;

export type ServiceList = ReturnType<typeof initDependencies>["services"];

function initDependencies() {
  const repositories = {
    class: new ClassRepository(),
    student: new StudentRepository(),
    parent: new ParentRepository(),
    teacher: new TeacherRepository(),
  };

  const teacherService = new TeacherService(repositories.teacher);
  const parentService = new ParentService(repositories.parent);
  const studentService = new StudentService(
    repositories.student,
    parentService
  );
  const classService = new ClassService(
    repositories.class,
    teacherService,
    studentService
  );

  return {
    services: {
      class: classService,
      student: studentService,
      parent: parentService,
      teacher: teacherService,
    },
  };
}

async function main(layers: Application, config: AppConfig) {
  const { services } = initDependencies();

  const { start, stop } = await layers(config, services);

  process.on("SIGINT", async () => {
    console.info("SIGINT signal received.");
    await stop();
  });

  process.on("SIGTERM", async () => {
    console.info("SIGTERM signal received.");
    await stop();
  });

  process.on("unhandledRejection", (reason) => {
    console.info("unhandledRejection signal received.", reason);
  });

  process.on("uncaughtException", async (err) => {
    console.info("uncaughtException signal received.", err);
    await stop();
  });

  return start();
}

await main(WebLayer, appConfig);
