import { HttpException, HttpStatus } from '@nestjs/common';

export default class AuthConflictException extends HttpException {
    constructor(
        details: Array<{ field: string; message: string }>,
        customMessage?: string,
    ) {
        super(
            {
                statusCode: HttpStatus.CONFLICT,
                message: customMessage || 'Conflict',
                details,
            },
            HttpStatus.CONFLICT,
        );
    }
}
