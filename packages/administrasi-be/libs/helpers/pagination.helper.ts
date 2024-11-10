import { ResponseHelper } from "./response.helper";
import { StatementScopeHelper } from "./statement-scope.helper";
interface LooseObject {
    [key: string]: any
}
export const paginate = async <T = any>(model: {
    count: (args: any) => Promise<any>,
    findMany: (args: any) => Promise<any>
}, options?: StatementScopeHelper, include?: T,): Promise<ResponseHelper> => {
    const includeCount: LooseObject = include || {}
    const includeFind: LooseObject = include || {}

    const countOptions = {
        ...options.paginationOptions(),
    }

    const findOptions = {
        ...options.paginationOptions(),
    }

    if (!countOptions?.where) {
        Object.assign(countOptions, { where: {} })
    }

    if (!findOptions?.where) {
        Object.assign(findOptions, { where: {} })
    }

    if (!includeCount?.where) {
        Object.assign(includeCount, { where: {} })
    }

    if (!includeFind?.where) {
        Object.assign(includeFind, { where: {} })
    }


    countOptions.where = {
        ...countOptions.where,
        ...includeCount.where
    }

    findOptions.where = {
        ...findOptions.where,
        ...includeFind.where
    }

    delete countOptions.take
    delete countOptions.skip

    const totalCount = await model.count({
        ...countOptions
    });

    const result = await model.findMany({
        ...findOptions,
        ...include
    });

    return new ResponseHelper({
        data: {
            count: totalCount,
            currentPage: (options.paginationOptions().skip / options.paginationOptions().take) + 1,
            limit: +options.paginationOptions().take,
            result,
        }
    });
}