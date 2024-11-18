import { Envs } from "@/types/Envs";

export class EnvServer {
  static env: Envs | NodeJS.ProcessEnv;
  static init(env: Envs | NodeJS.ProcessEnv) {
    this.env = env;
  }
}