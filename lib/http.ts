export class HttpException extends Error {
 constructor(public response:string|Record<string,unknown>,public status:number){super(typeof response==='string'?response:String(response.message||'Request failed'));}
 getStatus(){return this.status;}
 getResponse(){return this.response;}
}
export class BadRequestException extends HttpException{constructor(message:any='Bad Request'){super(message,400)}}
export class UnauthorizedException extends HttpException{constructor(message='Unauthorized'){super(message,401)}}
export class ForbiddenException extends HttpException{constructor(message='Forbidden resource'){super(message,403)}}
export class NotFoundException extends HttpException{constructor(message='Not Found'){super(message,404)}}
export class ConflictException extends HttpException{constructor(message='Conflict'){super(message,409)}}
export class InternalServerErrorException extends HttpException{constructor(message='Internal server error'){super(message,500)}}
export const HttpStatus={NOT_FOUND:404};
