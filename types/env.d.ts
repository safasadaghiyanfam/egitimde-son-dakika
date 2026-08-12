/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
  }
}
