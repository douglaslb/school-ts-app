import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import helmet from "helmet";
import type { Server } from "http";
import type { ServiceList } from "../app.js";
import type { AppConfig } from "../config.js";
import { parentRouterFactory } from "./parent.js";
import { NotFoundError } from "../domain/errors/NotFound.js";

export async function WebLayer(config: AppConfig, services: ServiceList) {
  const app = express();
  let server: Server | undefined;

  app.use(helmet());
  app.use(express.json());

  app.use("/parents", parentRouterFactory(services.parent, services.student));
  // app.use("/classes", classRouterFactory());
  // app.use("/teacher", classRouterFactory());
  // app.use("/students", classRouterFactory());

  app.get("/ping", (req, res) => {
    res.send("pong").end();
  });

  app.use(async (err: any, _: Request, res: Response, next: NextFunction) => {
    if (err) {
      return res.status(err?.status ?? 500).json({
        code: err?.code ?? "UNKNOWN_ERROR",
        message: err?.message ?? "No error message",
        name: err?.name ?? "InternalError",
      });
    }

    next();
  });

  const start = async () => {
    console.debug(`Starting server`);
    server = app.listen(config.PORT, () => {
      console.info(`Listening on port ${config.PORT}`);
    });
  };

  const stop = async () => {
    console.debug(`Stopping server`);

    if (server) {
      server.close((err) => {
        let exitCode = 0;

        if (err) {
          console.error(`Error stopping server: ${err}`);
          exitCode = 1;
        }
        console.log(`Server stopped`);
        process.exit(exitCode);
      });
    }
  };

  return {
    start,
    stop,
  };
}
