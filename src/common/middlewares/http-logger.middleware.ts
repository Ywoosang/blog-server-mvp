import { Injectable, type NestMiddleware, Logger } from '@nestjs/common';
import { type Request, type Response, type NextFunction } from 'express';

class CustomLogger extends Logger {
    log(message: string): void {
        const timestamp = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
        });
        super.log(`[${timestamp}] ${message}`);
    }
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger = new CustomLogger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';

        res.on('finish', () => {
            const { statusCode } = res;
            this.logger.log(
                `${method} ${statusCode} - ${originalUrl} - ${ip} - ${userAgent}`,
            );
        });

        next();
    }
}
