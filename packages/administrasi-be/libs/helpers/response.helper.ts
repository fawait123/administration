import { BaseResponse } from "./base-response.helper"

export class ResponseHelper<T = any> extends BaseResponse {
    data: T

    constructor(data: Partial<ResponseHelper<T>>) {
        super(data)
        Object.assign(this, data)
    }
}