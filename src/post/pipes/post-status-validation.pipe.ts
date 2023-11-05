import { BadRequestException, ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { PostStatus } from '../post-status.enum';

export class PostStatusValidationPipe implements PipeTransform {
	// 클래스 외부에서 접근을 할 수 있으나 변경 불가
	readonly StatusOptions = [
		PostStatus.PRIVATE,
		PostStatus.PUBLIC
	]
	
	// 문자열을 대문자로 변경해줘서 PRIVATE, PUBLIC 
	transform(value: any, metadata: ArgumentMetadata) {
		value = value.toUpperCase();
		
		// value: 넣어준 status 값
		// metadata { metatype: [Function: String], type: 'body', data: 'status' }
		
		// status 를 Private 또는 Public 2가지 값을 가지는 enum 이여야 하는데
		// 모든 값이 다 들어간다는 문제점
		// 커스텀 파이프에서 두 가지 값에 해당하지 않으면 에러를 발생하게 해야 함
	 	
		if(!this.isStatusValid(value)) {
			throw new BadRequestException(`${value} isn't in the status opt`);
		}
		
		return value;
	}
	// 값은 PRIVATE 또는 PUBLIC 이어야 함
	private isStatusValid(status: any) {
		const index = this.StatusOptions.indexOf(status);
		return index !== -1;
	}
}