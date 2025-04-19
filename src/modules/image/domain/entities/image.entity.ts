import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';
import { IsEnum } from 'class-validator';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ comment: 'Public URL of the image in the storage provider' })
  url: string;

  @Column({ comment: 'Key (path/filename) of the object in the S3 bucket' })
  key: string; // e.g., 'players/uuid-player/imagename-timestamp.jpg'

  @Column({ comment: 'Name of the S3 bucket where the image is stored' })
  bucket: string;

  @Column({ comment: 'MIME type of the image' })
  mimeType: string;

  @Column({ type: 'bigint', comment: 'Size of the image in bytes' })
  size: number;

  @Column({ nullable: true, comment: 'Original filename from upload' })
  originalFilename?: string;

  @Index()
  @IsEnum(ImageEntities)
  @Column({
    comment: 'Type of the entity this image belongs to (e.g., Player, Team)',
  })
  entityType: ImageEntities;

  @Column({ comment: 'ID of the entity instance this image belongs to' })
  @Index()
  entityId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
