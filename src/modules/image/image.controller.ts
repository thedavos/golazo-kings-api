import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { ImageService } from '@modules/image/services/image.service';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';
import {
  ImageQueryOptions,
  UploadFromUrlDto,
  UploadImageDto,
  BulkUploadResultDto,
} from '@modules/image/dtos/upload-image.dto';
import { ImageStatsDto } from '@modules/image/dtos/image-stats.dto';
import { Image } from '@modules/image/domain/entities/image.entity';
import { ImageListResponseDto } from '@modules/image/dtos/image-list-response.dto';

@ApiTags('Images')
@Controller('images')
@ApiExtraModels(Image)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Subir una imagen desde archivo',
    description:
      'Sube una imagen desde un archivo local y la asocia a una entidad específica. Soporta formatos JPEG, PNG, WebP y GIF con un tamaño máximo de 50MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos para subir la imagen',
    type: UploadImageDto,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, WebP, GIF)',
        },
        entityType: {
          type: 'string',
          enum: Object.values(ImageEntities),
          description: 'Tipo de entidad asociada',
          example: ImageEntities.LEAGUE,
        },
        entityId: {
          type: 'number',
          description: 'ID de la entidad asociada',
          example: 123,
        },
        metadata: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Metadatos adicionales (opcional)',
          example: { category: 'profile', description: 'Avatar del usuario' },
        },
      },
      required: ['file', 'entityType', 'entityId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: { $ref: getSchemaPath(Image) },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o datos incorrectos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Invalid file type. Allowed types: image/jpeg, image/png, image/webp, image/gif',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'Archivo demasiado grande',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 413 },
        message: {
          type: 'string',
          example: 'File too large. Maximum size: 50MB',
        },
        error: { type: 'string', example: 'Payload Too Large' },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: MultipartFile,
    @Body() body: { entityType: ImageEntities; entityId: number },
  ) {
    return await this.imageService.uploadImage({
      file,
      entityType: body.entityType,
      entityId: body.entityId,
    });
  }

  @Post('upload-from-url')
  @HttpCode(HttpStatus.CREATED)
  @Header('Content-Type', 'image/png')
  @ApiOperation({
    summary: 'Subir imagen desde URL',
    description:
      'Descarga una imagen desde una URL externa y la sube al storage. La URL debe apuntar a una imagen válida (JPEG, PNG, WebP, GIF) con un tamaño máximo de 50MB.',
  })
  @ApiBody({
    type: UploadFromUrlDto,
    description: 'Datos para descargar y subir la imagen',
    examples: {
      basic: {
        summary: 'Ejemplo básico',
        value: {
          imageUrl: 'https://example.com/image.jpg',
          entityType: 'PRODUCT',
          entityId: 456,
        },
      },
      withMetadata: {
        summary: 'Con metadatos',
        value: {
          imageUrl: 'https://example.com/image.jpg',
          entityType: 'PRODUCT',
          entityId: 456,
          filename: 'product-hero.jpg',
          metadata: {
            category: 'hero',
            alt: 'Imagen principal del producto',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen descargada y subida exitosamente',
    schema: { $ref: getSchemaPath(Image) },
  })
  @ApiResponse({
    status: 400,
    description: 'URL inválida o no accesible',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Unable to reach image URL: https://example.com/invalid.jpg',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada en la URL',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Image not found at URL: https://example.com/missing.jpg',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async uploadFromUrl(@Body() body: UploadFromUrlDto) {
    return await this.imageService.uploadImageFromUrl(body);
  }

  // Subir múltiples archivos
  @Post('upload-multiple')
  @ApiOperation({
    summary: 'Subir múltiples imágenes',
    description:
      'Sube hasta 10 imágenes simultáneamente. Retorna un resumen con las imágenes subidas exitosamente y las que fallaron.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Resultado de la subida múltiple',
    schema: { $ref: getSchemaPath(BulkUploadResultDto) },
  })
  async uploadMultiple(
    @UploadedFiles() files: MultipartFile[],
    @Body() body: { entityType: ImageEntities; entityId: number },
  ) {
    return await this.imageService.uploadMultipleImages(
      files,
      body.entityType,
      body.entityId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de imágenes',
    description:
      'Obtiene una lista paginada de imágenes con filtros opcionales por tipo de entidad, ID de entidad, y opciones de ordenamiento.',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: ImageEntities,
    description: 'Filtrar por tipo de entidad',
    example: 'USER',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de entidad',
    example: 123,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de resultados por página',
    example: 20,
    schema: { minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de resultados a omitir',
    example: 0,
    schema: { minimum: 0 },
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'size'],
    description: 'Campo por el cual ordenar',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Orden de clasificación',
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de imágenes obtenida exitosamente',
    schema: { $ref: getSchemaPath(ImageListResponseDto) },
  })
  async getImages(@Query() query: ImageQueryOptions) {
    return await this.imageService.getImages(query);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Obtener imágenes por entidad',
    description:
      'Obtiene todas las imágenes asociadas a una entidad específica, ordenadas por fecha de creación descendente.',
  })
  @ApiParam({
    name: 'entityType',
    enum: ImageEntities,
    description: 'Tipo de entidad',
    example: ImageEntities.LEAGUE,
  })
  @ApiParam({
    name: 'entityId',
    type: Number,
    description: 'ID de la entidad',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Imágenes de la entidad obtenidas exitosamente',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(Image) },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Entidad no encontrada',
  })
  async getImagesByEntity(
    @Param('entityType') entityType: ImageEntities,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<Image[]> {
    return await this.imageService.getImagesByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener imagen por ID',
    description: 'Obtiene los metadatos de una imagen específica por su ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la imagen',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen encontrada exitosamente',
    schema: { $ref: getSchemaPath(Image) },
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Image with ID 123 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getImageById(@Param('id', ParseIntPipe) id: number): Promise<Image> {
    return await this.imageService.getImageById(id);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Descargar imagen',
    description:
      'Descarga el archivo de imagen directamente. Retorna el archivo binario con los headers apropiados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la imagen',
    example: 123,
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  @ApiResponse({
    status: 200,
    description: 'Archivo de imagen descargado exitosamente',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
      'image/gif': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al descargar la imagen del storage',
  })
  @Get(':id/download')
  async downloadImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() reply: FastifyReply,
  ) {
    const { buffer, image } = await this.imageService.downloadImage(id);

    reply
      .headers({
        'Content-Type': image.mimeType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `attachment; filename="${image.originalFilename}"`,
      })
      .send(buffer);
  }

  @Post(':id/copy')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Copiar imagen',
    description:
      'Crea una copia de una imagen existente y la asocia a una nueva entidad. La copia se realiza a nivel de storage sin re-descargar el archivo.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la imagen a copiar',
    example: 123,
  })
  @ApiBody({
    description: 'Información de la nueva entidad',
    schema: {
      type: 'object',
      properties: {
        newEntityType: {
          type: 'string',
          enum: Object.values(ImageEntities),
          description: 'Tipo de la nueva entidad',
          example: 'PRODUCT',
        },
        newEntityId: {
          type: 'number',
          description: 'ID de la nueva entidad',
          example: 789,
        },
      },
      required: ['newEntityType', 'newEntityId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen copiada exitosamente',
    schema: { $ref: getSchemaPath(Image) },
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen original no encontrada',
  })
  async copyImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newEntityType: ImageEntities; newEntityId: number },
  ): Promise<Image> {
    return await this.imageService.copyImage(
      id,
      body.newEntityType,
      body.newEntityId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar imagen',
    description:
      'Elimina una imagen tanto del storage como de la base de datos. Esta operación es irreversible.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la imagen a eliminar',
    example: 123,
  })
  @ApiResponse({
    status: 204,
    description: 'Imagen eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al eliminar la imagen del storage',
  })
  @Delete(':id')
  async deleteImage(@Param('id') id: number) {
    await this.imageService.deleteImage(id);
    return { message: 'Image deleted successfully' };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de imágenes',
    description:
      'Obtiene estadísticas generales sobre las imágenes almacenadas, incluyendo totales, distribución por tipo de entidad y tipo MIME.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: { $ref: getSchemaPath(ImageStatsDto) },
  })
  async getStats() {
    return await this.imageService.getImageStats();
  }
}
