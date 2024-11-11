import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceAddtionalDto, CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) { }


export class UpdateInvoiceAdditonalDto extends PartialType(CreateInvoiceAddtionalDto) { }
