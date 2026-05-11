import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

type JsonResponse = {
  status(statusCode: number): {
    json(body: {
      statusCode: number;
      message: string;
      code?: string;
    }): void;
  };
};

@Catch(
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientValidationError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<JsonResponse>();

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        "Prisma failed to initialize. Check DATABASE_URL, PostgreSQL availability and migrations.",
        exception
      );

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: "База данных недоступна. Проверьте DATABASE_URL, PostgreSQL и миграции."
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`Prisma known request error: ${exception.code}`, exception);

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Ошибка запроса к базе данных.",
        code: exception.code
      });
      return;
    }

    this.logger.error("Unexpected Prisma error.", exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Внутренняя ошибка базы данных."
    });
  }
}
