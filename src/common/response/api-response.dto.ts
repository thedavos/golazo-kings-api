import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiResponseDto } from './response.dto';
import { ErrorResponseDto } from './error-response.dto';

/**
 * Obtiene mensaje por defecto para códigos de éxito
 */
export const getDefaultSuccessMessage = (status: HttpStatus): string => {
  const messages = {
    [HttpStatus.OK]: 'Request completed successfully',
    [HttpStatus.CREATED]: 'Resource created successfully',
    [HttpStatus.ACCEPTED]: 'Request accepted',
    [HttpStatus.NO_CONTENT]: 'Request completed successfully',
    [HttpStatus.PARTIAL_CONTENT]: 'Partial content returned',
  };

  return (
    messages[status as keyof typeof messages] ||
    'Request completed successfully'
  );
};

export class ApiResponse {
  static success<T>(
    reply: FastifyReply,
    data?: T,
    message?: string,
    status: HttpStatus = HttpStatus.OK,
    meta?: Record<string, any>,
  ) {
    const response: ApiResponseDto<T> = {
      success: true,
      statusCode: status,
      message: message || getDefaultSuccessMessage(status),
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    reply
      .code(status)
      .header('Content-Type', 'application/json')
      .send(response);
  }

  /**
   * Envía una respuesta de error siguiendo RFC 7807 (Problem Details)
   */
  static error(
    reply: FastifyReply,
    title: string,
    status: HttpStatus,
    detail?: string,
    type?: string,
    instance?: string,
    extensions?: Record<string, any>,
  ) {
    const request = reply.request;

    const errorResponse: ErrorResponseDto = {
      type: type || `https://httpstatuses.com/${status}`,
      title,
      status,
      detail,
      instance: instance || request.url,
      ...extensions,
    };

    reply
      .code(status)
      .header('Content-Type', 'application/json')
      .send(errorResponse);
  }

  /**
   * Respuesta para errores de validación (400)
   */
  static badRequest(reply: FastifyReply, errors: any[], detail?: string) {
    return this.error(
      reply,
      'Validation Failed',
      HttpStatus.BAD_REQUEST,
      detail || 'The request contains invalid parameters',
      'https://example.com/problems/validation-error',
      reply.request.url,
      { errors },
    );
  }

  /**
   * Respuesta para recursos no encontrados (404)
   */
  static notFound(reply: FastifyReply, resource?: string, detail?: string) {
    const resourceName = resource || 'Resource';

    return this.error(
      reply,
      `${resourceName} Not Found`,
      HttpStatus.NOT_FOUND,
      detail ||
        `The requested ${resource?.toLowerCase() || 'resource'} could not be found`,
      'https://example.com/problems/not-found',
    );
  }

  /**
   * Respuesta para errores de autorización (401)
   */
  static unauthorized(reply: FastifyReply, detail?: string) {
    return this.error(
      reply,
      'Unauthorized',
      HttpStatus.UNAUTHORIZED,
      detail || 'Authentication is required to access this resource',
      'https://example.com/problems/unauthorized',
    );
  }

  /**
   * Respuesta para errores de permisos (403)
   */
  static forbidden(reply: FastifyReply, detail?: string) {
    return this.error(
      reply,
      'Forbidden',
      HttpStatus.FORBIDDEN,
      detail || 'You do not have permission to access this resource',
      'https://example.com/problems/forbidden',
    );
  }

  /**
   * Respuesta para errores internos del servidor (500)
   */
  static internalServerError(reply: FastifyReply, detail?: string) {
    return this.error(
      reply,
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      detail || 'An unexpected error occurred',
      'https://example.com/problems/internal-server-error',
    );
  }

  /**
   * Respuesta para recursos creados (201)
   */
  static created<T>(
    reply: FastifyReply,
    data: T,
    message?: string,
    location?: string,
  ) {
    if (location) {
      reply.header('Location', location);
    }

    this.success(
      reply,
      data,
      message || 'Resource created successfully',
      HttpStatus.CREATED,
    );
  }

  /**
   * Respuesta sin contenido (204)
   */
  static noContent(reply: FastifyReply): FastifyReply {
    return reply.code(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Respuesta para operaciones aceptadas pero pendientes (202)
   */
  static accepted<T>(reply: FastifyReply, data?: T, message?: string) {
    this.success(
      reply,
      data,
      message || 'Request accepted and is being processed',
      HttpStatus.ACCEPTED,
    );
  }
}
