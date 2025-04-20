import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

export const IMAGE_VALIDATION_PIPE = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 MB
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
  ],
});
