import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CompanyContext: () => ParameterDecorator = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        return request.company || null;
    },
);