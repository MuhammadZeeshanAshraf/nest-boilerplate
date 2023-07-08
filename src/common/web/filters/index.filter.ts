import { ExceptionFilter } from "@nestjs/common";
import { DtoValidationExceptionHandler } from "./bad-request-exception.filter";
import { InternalServerExceptionFilter } from "./internal-server-exception.filter";

export const exceptionFilters : ExceptionFilter[]= [
    new DtoValidationExceptionHandler(),
    new InternalServerExceptionFilter(),
]