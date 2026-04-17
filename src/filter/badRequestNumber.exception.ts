import { BadRequestException } from '@nestjs/common';

export class BadRequestExceptionNumData extends BadRequestException {
  constructor(message: string) {
    super({
      message: message,
      data: 0,
    });
  }
}
