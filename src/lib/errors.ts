import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { useMemo } from "react";
import { ZodError, z } from "zod";
import { AppRouter } from "~/server/api/root";

export function asDatabseError(error: any) {
  if (error.name === "DatabaseError") {
    return {
      message: error.body?.message ?? "Database error",
      code: error.body?.code ?? "UNKNOWN",
      get parsedCode() {
        const fragment = this.message.split(`'`)[0];
        const regex = /code \= ([A-Za-z0-9]+) /;
        const match = fragment.match(regex);
        return match?.[1] ?? null;
      },
    };
  }

  return null;
}

export function newTRPCError(
  code: TRPC_ERROR_CODE_KEY,
  cause: string,
  message?: string,
) {
  return new TRPCError({
    code,
    cause,
    message,
  });
}

export function newServerInternalError(
  error: any,
  cause?: any,
  message?: string,
) {
  console.log("A error has occurred", error, cause, message);

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause,
    message: message ?? "An internal error has occurred, try again later.",
  });
}

export function asTRPCError(error: any) {
  if (isTRPCClientError(error)) {
    return {
      cause: ((error.data as any).cause as string) ?? "UNKNOWN",
      message: error.message as string,
      code: error.data?.code ?? "UNKNOWN",
    };
  }
  return null;
}

export function asZODError<T>(error: any) {
  if (error instanceof ZodError || error.name === "ZodError") {
    return error as ZodError<T>;
  }

  return null;
}

export function isTRPCClientError(
  error: any,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError || error.name === "TRPCClientError";
}

export function validateWithZod<T>(value: T, schema: z.Schema<T>) {
  try {
    schema.parse(value);
  } catch (e) {
    const error = asZODError<typeof schema>(e);
    if (error) {
      return error;
    }
  }

  return null;
}

export function useValidationError<T>(value: T, schema: z.Schema<T>) {
  return useMemo(() => {
    return validateWithZod(value, schema);
  }, [value, schema]);
}

export function useValidationErrorMessages<T>(value: T, schema: z.Schema<T>) {
  return (
    useValidationError(value, schema)?.issues.map((issue) => issue.message) ||
    null
  );
}

export function useValidationErrorMessage<T>(value: T, schema: z.Schema<T>) {
  return useValidationErrorMessages(value, schema)?.[0] || null;
}
