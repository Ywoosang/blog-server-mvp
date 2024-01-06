export class FindTagsResponseDto {
    tags: {
        id: number;
        name: string;
        postCount: number;
    }[];
}
