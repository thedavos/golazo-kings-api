import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
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
    res: Response,
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

    res.status(status).json(response);
  }

  /**
   * Envía una respuesta de error siguiendo RFC 7807 (Problem Details)
   */
  static error(
    res: Response,
    title: string,
    status: HttpStatus,
    detail?: string,
    type?: string,
    instance?: string,
    extensions?: Record<string, any>,
  ) {
    const errorResponse: ErrorResponseDto = {
      type: type || `https://httpstatuses.com/${status}`,
      title,
      status,
      detail,
      instance: instance || res.req.url,
      ...extensions,
    };

    // Se agrega headers RFC 7807
    res.setHeader('Content-Type', 'application/problem+json');

    res.status(status).json(errorResponse);
  }

  /**
   * Respuesta para errores de validación (400)
   */
  static badRequest(res: Response, errors: any[], detail?: string) {
    return this.error(
      res,
      'Validation Failed',
      HttpStatus.BAD_REQUEST,
      detail || 'The request contains invalid parameters',
      'https://example.com/problems/validation-error',
      res.req.url,
      { errors },
    );
  }

  /**
   * Respuesta para recursos no encontrados (404)
   */
  static notFound(res: Response, resource?: string, detail?: string) {
    const resourceName = resource || 'Resource';

    return this.error(
      res,
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
  static unauthorized(res: Response, detail?: string) {
    return this.error(
      res,
      'Unauthorized',
      HttpStatus.UNAUTHORIZED,
      detail || 'Authentication is required to access this resource',
      'https://example.com/problems/unauthorized',
    );
  }

  /**
   * Respuesta para errores de permisos (403)
   */
  static forbidden(res: Response, detail?: string) {
    return this.error(
      res,
      'Forbidden',
      HttpStatus.FORBIDDEN,
      detail || 'You do not have permission to access this resource',
      'https://example.com/problems/forbidden',
    );
  }

  /**
   * Respuesta para errores internos del servidor (500)
   */
  static internalServerError(res: Response, detail?: string) {
    return this.error(
      res,
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
    res: Response,
    data: T,
    message?: string,
    location?: string,
  ) {
    if (location) {
      res.setHeader('Location', location);
    }

    this.success(
      res,
      data,
      message || 'Resource created successfully',
      HttpStatus.CREATED,
    );
  }

  /**
   * Respuesta sin contenido (204)
   */
  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Respuesta para operaciones aceptadas pero pendientes (202)
   */
  static accepted<T>(res: Response, data?: T, message?: string) {
    this.success(
      res,
      data,
      message || 'Request accepted and is being processed',
      HttpStatus.ACCEPTED,
    );
  }
}
