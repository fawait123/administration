export class BaseResponse<T = any> {
    constructor(partial: T) {
        Object.assign(this, partial);
    }
}