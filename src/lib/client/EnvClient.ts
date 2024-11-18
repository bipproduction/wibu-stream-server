"use client";
 import { Envs } from "@/types/Envs";
 export class EnvClient {
   static env: Envs | NodeJS.ProcessEnv;
   static init(env: Envs | NodeJS.ProcessEnv) {
     this.env = env;
   }
 }

 export function EnvClientProvider({ env }: { env: string }) {
   try {
     EnvClient.init(JSON.parse(env));
   } catch (error) {
     console.log(error);
   }
   return null;
 }