import { FileDriver } from 'src/files/enum/file-driver.enum';

export interface AppConfig {
    port?: number;
    backendDomain?: string;
    frontendDomain?: string;
    workingDirectory?: string;
}

export interface AuthConfig {
    secret?: string;
    expires?: string;
    refreshSecret?: string;
    refreshExpires?: string;
    confirmEmailSecret?: string;
    emailExpires?: string;
}

export interface DatabaseConfig {
    type?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    name?: string;
    synchronize?: boolean;
}

export interface MailConfig {
    service?: string;
    user?: string;
    password?: string;
    defaultEmail?: string;
}

export interface SocialConfig {
    clientId?: string;
    clientSecret?: string;
}

export interface FilesConfig {
    driver: FileDriver;
    accessKeyId?: string;
    secretAccessKey?: string;
    awsS3Region?: string;
    awsS3Bucket?: string;
    maxFileSize: number;
}

export interface GoogleConfig extends SocialConfig {}
export interface GithubConfig extends SocialConfig {}
export interface KakaoConfig extends SocialConfig {}

export interface AllConfigType {
    app: AppConfig;
    auth: AuthConfig;
    database: DatabaseConfig;
    mail: MailConfig;
    google: GoogleConfig;
    github: GithubConfig;
    kakao: KakaoConfig;
    file: FilesConfig;
}
