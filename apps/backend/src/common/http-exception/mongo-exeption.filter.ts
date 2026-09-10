import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { MongoError } from "mongodb";

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Identify the error by its code
    switch (exception.code) {
      case 11000:
        // Duplicate key error
        const duplicateKey =
          exception.errmsg?.match(/index: (.+?) dup key/)[1] || "key";
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `${
            duplicateKey.charAt(0).toUpperCase() + duplicateKey.slice(1)
          } already exists.`,
          error: "Conflict",
        });

      case 121:
        // Document validation failure
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Document validation failed. Please check your input.",
          error: "Bad Request",
        });

      case 66:
        // Immutable field error
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Attempt to modify an immutable field.",
          error: "Bad Request",
        });

      case 50:
        // Exceeded time limit
        return response.status(HttpStatus.REQUEST_TIMEOUT).json({
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message:
            "The operation took too long to complete. Please try again later.",
          error: "Request Timeout",
        });

      case 13:
        // Unauthorized access
        return response.status(HttpStatus.FORBIDDEN).json({
          statusCode: HttpStatus.FORBIDDEN,
          message: "Unauthorized access to the database operation.",
          error: "Forbidden",
        });

      case 26:
        // Namespace not found (collection or database not found)
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Requested resource not found in the database.",
          error: "Not Found",
        });

      default:
        // General fallback for unknown errors
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "An unexpected database error occurred.",
          error: "Internal Server Error",
        });
    }
  }
}
