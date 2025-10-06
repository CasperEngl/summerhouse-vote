import { DatabaseService } from "@/database";
import { Layer, Logger, LogLevel, ManagedRuntime, Schema } from "effect";

// Define log level schema
export const LogLevelSchema = Schema.Literal(
  "All",
  "Fatal",
  "Error",
  "Warning",
  "Info",
  "Debug",
  "Trace",
  "None",
);

// Map string log levels to Effect LogLevel
const logLevelMap: Record<typeof LogLevelSchema.Type, LogLevel.LogLevel> = {
  All: LogLevel.All,
  Fatal: LogLevel.Fatal,
  Error: LogLevel.Error,
  Warning: LogLevel.Warning,
  Info: LogLevel.Info,
  Debug: LogLevel.Debug,
  Trace: LogLevel.Trace,
  None: LogLevel.None,
};

// Get log level from environment variable with validation
export const getLogLevel = (): LogLevel.LogLevel => {
  const envLevel = process.env.LOG_LEVEL;

  if (!envLevel) {
    return LogLevel.Info; // Default to Info level
  }

  const result = Schema.decodeUnknownEither(LogLevelSchema)(envLevel);

  if (result._tag === "Left") {
    console.warn(
      `Invalid LOG_LEVEL "${envLevel}". Valid values are: All, Fatal, Error, Warning, Info, Debug, Trace, None. Using Info as default.`,
    );
    return LogLevel.Info;
  }

  return logLevelMap[result.right];
};

export const ServerRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    Logger.minimumLogLevel(getLogLevel()),
    DatabaseService.Default,
  ),
);
