import { ResponseHelper } from './response.helper';
import { StatementScopeHelper } from './statement-scope.helper';
interface LooseObject {
  [key: string]: any;
}
export const paginate = async <T = any>(
  model: {
    count: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any>;
  },
  options?: StatementScopeHelper,
  include?: T,
): Promise<ResponseHelper> => {
  const additionalOptions: LooseObject = include || {};
  if (!additionalOptions.where) {
    additionalOptions.where = {};
  }

  if (!additionalOptions.include) {
    additionalOptions.include = {};
  }

  const totalCount = await model.count({
    where: {
      ...options.paginationOptions().where,
      ...additionalOptions.where,
    },
  });

  const result = await model.findMany({
    take: options.paginationOptions().take,
    skip: options.paginationOptions().skip,
    where: {
      ...options.paginationOptions().where,
      ...additionalOptions.where,
    },
    include: {
      ...additionalOptions.include,
    },
  });

  return new ResponseHelper({
    data: {
      count: totalCount,
      currentPage:
        options.paginationOptions().skip / options.paginationOptions().take + 1,
      limit: +options.paginationOptions().take,
      result,
    },
  });
};

export const all = async <T = any>(
  model: {
    findMany: (args: any) => Promise<any>;
  },
  options?: StatementScopeHelper,
  include?: T,
): Promise<ResponseHelper> => {
  const additionalOptions: LooseObject = include || {};
  if (!additionalOptions.where) {
    additionalOptions.where = {};
  }

  if (!additionalOptions.include) {
    additionalOptions.include = {};
  }

  const result = await model.findMany({
    where: {
      ...options.paginationOptions().where,
      ...additionalOptions.where,
    },
    include: {
      ...additionalOptions.include,
    },
  });

  return new ResponseHelper({
    data: {
      result,
    },
  });
};
