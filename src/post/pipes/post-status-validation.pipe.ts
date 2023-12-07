import { BadRequestException, ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { PostStatus } from '../post-status.enum';

export class PostStatusValidationPipe implements PipeTransform {
    readonly StatusOptions = [PostStatus.PRIVATE, PostStatus.PUBLIC];

    transform(value: any, _metadata: ArgumentMetadata) {
        value = value.toUpperCase();
        if (!this.isStatusValid(value)) {
            throw new BadRequestException(`${value} isn't in the status opt`);
        }

        return value;
    }

    private isStatusValid(status: any) {
        const index = this.StatusOptions.indexOf(status);

        return index !== -1;
    }
}
