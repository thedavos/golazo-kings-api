import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Image } from '@modules/image/domain/entities/image.entity';
import { S3_CLIENT } from '@modules/image/provider/s3-client.provider';
import { allowedEntityTypes } from '@modules/image/domain/image.constant';
import { ImageEntities } from '@/modules/image/domain/value-objects/image-entities.enum';

@Injectable()
export class ImageService {
  private readonly bucketName: string;
  private readonly publicUrlBase: string;

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('b2.bucket');
    this.publicUrlBase = this.configService.getOrThrow<string>('b2.publicUrl');
  }

  async uploadImage(
    file: Express.Multer.File,
    entityType: ImageEntities,
    entityId: number, // O string si usas UUIDs
  ): Promise<Image> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Validar tipo de entidad (opcional pero recomendado)
    if (!allowedEntityTypes.includes(entityType)) {
      throw new BadRequestException(`Invalid entity type: ${entityType}`);
    }

    const fileExtension = file.originalname.split('.').pop();
    const uniqueKey = `${entityType.toLowerCase()}/${entityId}/${uuidv4()}.${fileExtension}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: uniqueKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // B2 maneja la visibilidad a nivel de bucket (público o privado)
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
    } catch (error) {
      console.error('Error uploading to Backblaze B2:', error);
      throw new InternalServerErrorException(
        'Failed to upload image to storage.',
      );
    }

    // Construir la URL pública
    // Asegúrate que B2_PUBLIC_URL_BASE termine SIN / y que el bucket esté configurado como público
    const imageUrl = `${this.publicUrlBase}/${this.bucketName}/${uniqueKey}`;

    const imageEntity = this.imageRepository.create({
      url: imageUrl,
      key: uniqueKey,
      bucket: this.bucketName,
      mimeType: file.mimetype,
      size: file.size,
      originalFilename: file.originalname,
      entityType: entityType,
      entityId: entityId,
    });

    try {
      return await this.imageRepository.save(imageEntity);
    } catch (dbError) {
      console.error('Error saving image metadata to DB:', dbError);
      // Intentar eliminar el objeto de S3 si falla la DB (compensación)
      try {
        await this.deleteObjectFromS3(uniqueKey);
      } catch (s3DeleteError) {
        console.error(
          'Failed to delete object from S3 after DB error:',
          s3DeleteError,
        );
        // Loggear este error es importante, el objeto quedó huérfano en S3
      }
      throw new InternalServerErrorException('Failed to save image metadata.');
    }
  }

  async findImagesForEntity(
    entityType: ImageEntities,
    entityId: number,
  ): Promise<Image[]> {
    return this.imageRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'ASC' }, // O como prefieras ordenarlas
    });
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.imageRepository.findOneBy({ id: imageId });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found.`);
    }

    try {
      await this.deleteObjectFromS3(image.key);
    } catch (error) {
      console.error(`Error deleting object ${image.key} from B2:`, error);
      // lanzar un error aquí o solo loggearlo
      // Eliminar el registro de la DB aunque falle en S3
      // throw new InternalServerErrorException('Failed to delete image from storage.');
    }

    try {
      await this.imageRepository.remove(image);
    } catch (dbError) {
      console.error('Error deleting image metadata from DB:', dbError);
      throw new InternalServerErrorException(
        'Failed to delete image metadata.',
      );
    }
  }

  private async deleteObjectFromS3(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    await this.s3Client.send(new DeleteObjectCommand(deleteParams));
  }

  async findImageByUuid(uuid: string): Promise<Image | null> {
    return this.imageRepository.findOneBy({ uuid });
  }

  async findImageById(id: number): Promise<Image | null> {
    return this.imageRepository.findOneBy({ id });
  }
}
