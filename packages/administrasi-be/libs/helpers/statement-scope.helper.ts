import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';

export class StatementScopeHelper<T = any> {
  params: PaginationDto;
  attributes: string[];
  constructor(
    params: Partial<StatementScopeHelper<PaginationDto>>,
    attributes: Partial<string[]>,
  ) {
    Object.assign(this, params);
    this.attributes = attributes;
  }

  whereOptions() {
    const where = [];
    if (this.params.search) {
      this.attributes.map((item: string) => {
        where.push({
          [item]: {
            contains: this.params.search,
          },
        });
      });
    }

    return where.length > 0 ? { OR: where } : {};
  }

  paginationOptions(): T {
    const page = this.params.page ? +this.params.page : 1;
    const limit = this.params.limit ? +this.params.limit : 10;
    const options = {
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...this.whereOptions(),
      },
    };

    return options as T;
  }
}
