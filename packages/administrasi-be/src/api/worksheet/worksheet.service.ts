import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { formatRupiah, getEnv, numberToTextRupiah } from 'libs/helpers';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorksheetService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMemberWorkResult(id: string) {
    const exist = await this.prismaService.memberWorkResult.findFirst({
      where: {
        id,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
        bon: true,
        employee: true,
      },
    });

    if (!exist) {
      throw new BadRequestException('Data tidak ditemukan');
    }

    return exist;
  }

  async exportMemberWorkResult(res: Response, id: string) {
    const memberWorkResult = await this.getMemberWorkResult(id);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hasil Kerja Anggota');
    // Add a title
    worksheet.mergeCells('A1:G1'); // Merge cells A1 and B1 for the title
    worksheet.getCell('A1').value = getEnv('setting.env', 'COMPANY_NAME'); // Set the title text
    worksheet.getCell('A1').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A2:G2'); // Merge cells A2 and B1 for the title
    worksheet.getCell('A2').value = getEnv('setting.env', 'COMPANY_ADDRESS'); // Set the title text
    worksheet.getCell('A2').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A2').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A3:G3'); // Merge cells A3 and B1 for the title
    worksheet.getCell('A3').value =
      `Email ${getEnv('setting.env', 'COMPANY_EMAIL')} telphone ${getEnv('setting.env', 'COMPANY_PHONE')}`; // Set the title text
    worksheet.getCell('A3').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A7:G7'); // Merge cells A7 and B1 for the title
    worksheet.getCell('A7').value = memberWorkResult.employee.name; // Set the title text
    worksheet.getCell('A7').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A7').alignment = {
      vertical: 'distributed',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A8:G8'); // Merge cells A8 and B1 for the title
    worksheet.getCell('A8').value = memberWorkResult.date; // Set the title text
    worksheet.getCell('A8').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A8').alignment = {
      vertical: 'distributed',
      horizontal: 'center',
    }; // Center alignment

    // Leave a blank row (row 6) for separation
    worksheet.addRow([]);

    // Define headers in row 7
    worksheet.getRow(9).values = [
      'NO',
      'PETAK',
      'LUAS',
      'KEGIATAN',
      'HARGA',
      'QL',
      'JUMLAH',
    ];
    worksheet.getRow(9).font = {
      bold: true,
      color: {
        argb: 'FFFFFF',
      },
    };
    worksheet.getRow(9).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getRow(9).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'A6AEBF' }, // Light gray background for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Set column width and add styles
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'petak', width: 20 },
      { key: 'luas', width: 10 },
      { key: 'kegiatan', width: 40 },
      { key: 'harga', width: 20 },
      { key: 'ql', width: 20 },
      { key: 'jumlah', width: 20 },
    ];

    // Add data rows starting from row 8
    const dataRows = memberWorkResult.activities.map((item) => {
      return {
        petak: item.plot,
        luas: item.wide,
        kegiatan: item.activity.name,
        harga: item.price,
        ql: '',
        jumlah: item.price * item.wide,
      };
    });

    dataRows.forEach((data, index) => {
      const row = worksheet.addRow({
        ...data,
        jumlah: formatRupiah(data.jumlah),
        price: formatRupiah(data.harga),
        no: index + 1,
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const cellTotal = dataRows.length + 9 + 1;
    worksheet.mergeCells(`A${cellTotal}:B${cellTotal}`);
    worksheet.getCell(`A${cellTotal}`).value = 'TOTAL LUAS';
    worksheet.getCell(`C${cellTotal}`).value =
      memberWorkResult.activities.reduce((prev, next) => prev + next.wide, 0);
    worksheet.getCell(`D${cellTotal}`).value = '';
    worksheet.mergeCells(`E${cellTotal}:F${cellTotal}`);
    worksheet.getCell(`E${cellTotal}`).value = 'TOTAL';
    worksheet.getCell(`G${cellTotal}`).value = formatRupiah(
      memberWorkResult.activities.reduce(
        (prev, next) => prev + next.subTotal,
        0,
      ),
    );
    worksheet.getRow(cellTotal).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4CC9FE' }, // Light gray background for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = {
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };
    });

    const initalCell = 14 + dataRows.length;
    // Add a title
    memberWorkResult.bon.map((item, index) => {
      worksheet.mergeCells(
        `E${initalCell + (index + 1)}:F${initalCell + (index + 1)}`,
      );
      worksheet.getCell(`E${initalCell + (index + 1)}`).value = item.note; // Set the title text
      worksheet.getCell(`E${initalCell + (index + 1)}`).font = { size: 12 }; // Set font size and bold
      worksheet.getCell(`G${initalCell + (index + 1)}`).value = formatRupiah(
        item.total,
      );
      worksheet.getRow(initalCell + (index + 1)).eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.mergeCells(
      `E${initalCell + memberWorkResult.bon.length + 1}:F${initalCell + memberWorkResult.bon.length + 1}`,
    );
    worksheet.getCell(
      `E${initalCell + memberWorkResult.bon.length + 1}`,
    ).value = 'TOTAL BON'; // Set the title text
    worksheet.getCell(`E${initalCell + memberWorkResult.bon.length + 1}`).font =
      { size: 12 }; // Set font size and bold
    worksheet.getCell(
      `G${initalCell + memberWorkResult.bon.length + 1}`,
    ).value = formatRupiah(
      memberWorkResult.bon.reduce((prev, next) => prev + next.total, 0),
    );
    worksheet
      .getRow(initalCell + memberWorkResult.bon.length + 1)
      .eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '37AFE1' }, // Light gray background for headers
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFF',
          },
        };
      });

    worksheet.mergeCells(
      `E${initalCell + memberWorkResult.bon.length + 2}:F${initalCell + memberWorkResult.bon.length + 2}`,
    );
    worksheet.getCell(
      `E${initalCell + memberWorkResult.bon.length + 2}`,
    ).value = 'TOTAL BERSIH'; // Set the title text
    worksheet.getCell(`E${initalCell + memberWorkResult.bon.length + 2}`).font =
      { size: 12 }; // Set font size and bold
    worksheet.getCell(
      `G${initalCell + memberWorkResult.bon.length + 2}`,
    ).value = formatRupiah(
      memberWorkResult.activities.reduce(
        (prev, next) => prev + next.subTotal,
        0,
      ) - memberWorkResult.bon.reduce((prev, next) => prev + next.total, 0),
    );
    worksheet
      .getRow(initalCell + memberWorkResult.bon.length + 2)
      .eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '37AFE1' }, // Light gray background for headers
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFF',
          },
        };
      });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');

    res.send(buffer);
  }

  async getInvoice(id: string) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        id,
      },
      include: {
        invoiceActivities: {
          include: {
            activity: true,
          },
        },
        invoiceAdditionals: {
          include: {
            activity: true,
          },
        },
        Company: true,
        invoiceRetensi: true,
      },
    });

    if (!exist) {
      throw new BadRequestException('Data tidak ditemukan');
    }

    return exist;
  }

  async exportInvoiceActivity(res: Response, id: string) {
    const invoice = await this.getInvoice(id);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Add a title
    worksheet.mergeCells('A1:G1'); // Merge cells A1 and B1 for the title
    worksheet.getCell('A1').value = getEnv('setting.env', 'COMPANY_NAME'); // Set the title text
    worksheet.getCell('A1').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A2:G2'); // Merge cells A2 and B1 for the title
    worksheet.getCell('A2').value = getEnv('setting.env', 'COMPANY_ADDRESS'); // Set the title text
    worksheet.getCell('A2').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A2').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A3:G3'); // Merge cells A3 and B1 for the title
    worksheet.getCell('A3').value =
      `Email ${getEnv('setting.env', 'COMPANY_EMAIL')} telphone ${getEnv('setting.env', 'COMPANY_PHONE')}`; // Set the title text
    worksheet.getCell('A3').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A6:G6'); // Merge cells A6 and B1 for the title
    worksheet.getCell('A6').value = `INVOICE`; // Set the title text
    worksheet.getCell('A6').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A6').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A7:G7'); // Merge cells A7 and B1 for the title
    worksheet.getCell('A7').value = invoice.number; // Set the title text
    worksheet.getCell('A7').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A7').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A8:G8'); // Merge cells A8 and B1 for the title
    worksheet.getCell('A8').value = `Kepada Yth,`; // Set the title text
    worksheet.getCell('A8').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A8').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A9:G9'); // Merge cells A9 and B1 for the title
    worksheet.getCell('A9').value = invoice.Company.name; // Set the title text
    worksheet.getCell('A9').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A9').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A10:G10'); // Merge cells A10 and B1 for the title
    worksheet.getCell('A10').value = invoice.Company.address; // Set the title text
    worksheet.getCell('A10').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A10').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    worksheet.getRow(12).values = [
      'NO',
      'No. BAP/SPK',
      'COMPT/ZONA',
      'Activity',
      'Luas Compt',
      'Harga',
      'Harga Jual/Penggantian/Uang Muka/Termin',
    ];
    worksheet.getRow(12).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getRow(12).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '686D76' }, // Light gray background for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = {
        size: 14,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };
    });

    worksheet.columns = [
      {
        key: 'no',
        width: 5,
      },
      {
        key: 'bap',
        width: 20,
      },
      {
        key: 'zone',
        width: 20,
      },
      {
        key: 'activity',
        width: 50,
      },
      {
        key: 'wide',
        width: 20,
      },
      {
        key: 'price',
        width: 20,
      },
      {
        key: 'total',
        width: 30,
      },
    ];

    const dataRows = invoice.invoiceActivities.map((item) => {
      return {
        bap: item.bapNumber,
        zone: item.zone,
        activity: item.activity.name,
        wide: item.wide,
        price: formatRupiah(item.price),
        total: formatRupiah(item.total),
      };
    });
    dataRows.forEach((data, index) => {
      const row = worksheet.addRow({
        ...data,
        no: index + 1,
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.getColumn(2).eachCell((cell) => {
      cell.font = {
        bold: true,
      };
    });

    invoice.invoiceRetensi.map((item, index) => {
      const totalCell = 12 + dataRows.length;
      worksheet.mergeCells(
        `A${totalCell + (index + 1)}:F${totalCell + (index + 1)}`,
      );
      worksheet.getCell(`A${totalCell + (index + 1)}`).value = item.note;
      worksheet.getCell(`A${totalCell + (index + 1)}`).font = {
        bold: true,
      };
      worksheet.getCell(`A${totalCell + (index + 1)}`).alignment = {
        horizontal: 'right',
        vertical: 'middle',
      };
      worksheet.getCell(`G${totalCell + (index + 1)}`).value = formatRupiah(
        item.amount,
      );
      worksheet.getCell(`G${totalCell + (index + 1)}`).font = {
        bold: true,
      };
      worksheet.getRow(totalCell + (index + 1)).eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const totalCell = 12 + dataRows.length + invoice.invoiceRetensi.length;
    worksheet.mergeCells(`A${totalCell + 1}:F${totalCell + 1}`);
    worksheet.getCell(`A${totalCell + 1}`).value = 'TOTAL';
    worksheet.getCell(`A${totalCell + 1}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 1}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell(`G${totalCell + 1}`).value = formatRupiah(
      invoice.invoiceActivities.reduce((prev, next) => prev + next.total, 0),
    );
    worksheet.getCell(`G${totalCell + 1}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 2}:F${totalCell + 2}`);
    worksheet.getCell(`A${totalCell + 2}`).value =
      `PPH ${getEnv('tax.env', 'TAX_AMOUNT')}%`;
    worksheet.getCell(`A${totalCell + 2}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 2}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell(`G${totalCell + 2}`).value = formatRupiah(
      (+getEnv('tax.env', 'TAX_AMOUNT') *
        invoice.invoiceActivities.reduce(
          (prev, next) => prev + next.total,
          0,
        )) /
        100,
    );
    worksheet.getCell(`G${totalCell + 2}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 2).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 3}:F${totalCell + 3}`);
    worksheet.getCell(`A${totalCell + 3}`).value = 'TOTAL PEMBAYARAN';
    worksheet.getCell(`A${totalCell + 3}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 3}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell(`G${totalCell + 3}`).value = formatRupiah(
      invoice.invoiceActivities.reduce((prev, next) => prev + next.total, 0) -
        (+getEnv('tax.env', 'TAX_AMOUNT') *
          invoice.invoiceActivities.reduce(
            (prev, next) => prev + next.total,
            0,
          )) /
          100 -
        invoice.invoiceRetensi.reduce((prev, next) => prev + next.amount, 0),
    );
    worksheet.getCell(`G${totalCell + 3}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 3).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 4}:G${totalCell + 4}`);
    worksheet.getCell(`A${totalCell + 4}`).value =
      `Terbilang : # ${numberToTextRupiah(invoice.invoiceActivities.reduce((prev, next) => prev + next.total, 0) - (+getEnv('tax.env', 'TAX_AMOUNT') * invoice.invoiceActivities.reduce((prev, next) => prev + next.total, 0)) / 100).toLocaleUpperCase()}`;
    worksheet.getCell(`A${totalCell + 4}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 4).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.getCell(`A${totalCell + 6}`).value =
      'Kota Bangun, ' + moment(invoice.createdAt).format('DD MMMM YYYY');
    worksheet.getCell(`A${totalCell + 7}`).value = 'Hormat Kami';
    worksheet.getCell(`A${totalCell + 17}`).value = getEnv(
      'setting.env',
      'COMPANY_DIRECTURE',
    );
    worksheet.getCell(`A${totalCell + 17}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 18}`).value = 'Direktur';
    worksheet.getCell(`A${totalCell + 19}`).value = 'Pembayaran dilakukan ke:';

    worksheet.mergeCells(`A${totalCell + 20}:D${totalCell + 20}`);
    worksheet.getCell(`A${totalCell + 20}`).value = 'Nama Bank';
    worksheet.mergeCells(`E${totalCell + 20}:G${totalCell + 20}`);
    worksheet.getCell(`E${totalCell + 20}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_NAME')}`;
    worksheet.getCell(`A${totalCell + 20}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 20}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 21}:D${totalCell + 21}`);
    worksheet.getCell(`A${totalCell + 21}`).value = 'Nama Cabang';
    worksheet.mergeCells(`E${totalCell + 21}:G${totalCell + 21}`);
    worksheet.getCell(`E${totalCell + 21}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_BRANCH')}`;
    worksheet.getCell(`A${totalCell + 21}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 21}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 22}:D${totalCell + 22}`);
    worksheet.getCell(`A${totalCell + 22}`).value = 'Nomor Rekening';
    worksheet.mergeCells(`E${totalCell + 22}:G${totalCell + 22}`);
    worksheet.getCell(`E${totalCell + 22}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_REKENING')}`;
    worksheet.getCell(`A${totalCell + 22}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 22}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 23}:D${totalCell + 23}`);
    worksheet.getCell(`A${totalCell + 23}`).value = 'Nama Pemilik Rekening';
    worksheet.mergeCells(`E${totalCell + 23}:G${totalCell + 23}`);
    worksheet.getCell(`E${totalCell + 23}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_OWNER')}`;
    worksheet.getCell(`A${totalCell + 23}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 23}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');

    res.send(buffer);
  }

  async exportInvoiceAdditional(res: Response, id: string) {
    const invoice = await this.getInvoice(id);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Add a title
    worksheet.mergeCells('A1:G1'); // Merge cells A1 and B1 for the title
    worksheet.getCell('A1').value = getEnv('setting.env', 'COMPANY_NAME'); // Set the title text
    worksheet.getCell('A1').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A2:G2'); // Merge cells A2 and B1 for the title
    worksheet.getCell('A2').value = getEnv('setting.env', 'COMPANY_ADDRESS'); // Set the title text
    worksheet.getCell('A2').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A2').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A3:G3'); // Merge cells A3 and B1 for the title
    worksheet.getCell('A3').value =
      `Email ${getEnv('setting.env', 'COMPANY_EMAIL')} telphone ${getEnv('setting.env', 'COMPANY_PHONE')}`; // Set the title text
    worksheet.getCell('A3').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A6:G6'); // Merge cells A6 and B1 for the title
    worksheet.getCell('A6').value = `INVOICE`; // Set the title text
    worksheet.getCell('A6').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A6').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A7:G7'); // Merge cells A7 and B1 for the title
    worksheet.getCell('A7').value = invoice.number; // Set the title text
    worksheet.getCell('A7').font = { size: 14, bold: true }; // Set font size and bold
    worksheet.getCell('A7').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A8:G8'); // Merge cells A8 and B1 for the title
    worksheet.getCell('A8').value = `Kepada Yth,`; // Set the title text
    worksheet.getCell('A8').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A8').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A9:G9'); // Merge cells A9 and B1 for the title
    worksheet.getCell('A9').value = invoice.Company.name; // Set the title text
    worksheet.getCell('A9').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A9').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    // Add a title
    worksheet.mergeCells('A10:G10'); // Merge cells A10 and B1 for the title
    worksheet.getCell('A10').value = invoice.Company.address; // Set the title text
    worksheet.getCell('A10').font = { size: 14 }; // Set font size and bold
    worksheet.getCell('A10').alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }; // Center alignment

    worksheet.getRow(12).values = [
      'NO',
      'No. BAP/SPK',
      'Acitivy',
      'BAP Amount DPP',
    ];
    worksheet.mergeCells('D12:G12');
    worksheet.getRow(12).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getRow(12).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '686D76' }, // Light gray background for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = {
        size: 14,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };
    });

    worksheet.columns = [
      {
        key: 'no',
        width: 5,
      },
      {
        key: 'bap',
        width: 20,
      },
      {
        key: 'activity',
        width: 50,
      },
      {
        key: 'total',
        width: 30,
      },
    ];

    const dataRows = invoice.invoiceAdditionals.map((item) => {
      return {
        bap: item.bapNumber,
        activity: item.activity.name,
        total: formatRupiah(item.amount),
      };
    });
    dataRows.forEach((data, index) => {
      const row = worksheet.addRow({
        ...data,
        no: index + 1,
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      worksheet.mergeCells(`D${12 + (index + 1)}:G${12 + (index + 1)}`);
    });

    worksheet.getColumn(2).eachCell((cell) => {
      cell.font = {
        bold: true,
      };
    });

    const totalCell = 12 + dataRows.length;
    worksheet.mergeCells(`A${totalCell + 1}:C${totalCell + 1}`);
    worksheet.getCell(`A${totalCell + 1}`).value = 'TOTAL';
    worksheet.getCell(`A${totalCell + 1}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 1}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.mergeCells(`D${totalCell + 1}:G${totalCell + 1}`);
    worksheet.getCell(`D${totalCell + 1}`).value = formatRupiah(
      invoice.invoiceAdditionals.reduce((prev, next) => prev + next.amount, 0),
    );
    worksheet.getCell(`D${totalCell + 1}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 2}:C${totalCell + 2}`);
    worksheet.getCell(`A${totalCell + 2}`).value =
      `PPH ${getEnv('tax.env', 'TAX_AMOUNT')}%`;
    worksheet.getCell(`A${totalCell + 2}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 2}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.mergeCells(`D${totalCell + 2}:G${totalCell + 2}`);
    worksheet.getCell(`D${totalCell + 2}`).value = formatRupiah(
      (+getEnv('tax.env', 'TAX_AMOUNT') *
        invoice.invoiceAdditionals.reduce(
          (prev, next) => prev + next.amount,
          0,
        )) /
        100,
    );
    worksheet.getCell(`D${totalCell + 2}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 2).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 3}:C${totalCell + 3}`);
    worksheet.getCell(`A${totalCell + 3}`).value = 'TOTAL PEMBAYARAN';
    worksheet.getCell(`A${totalCell + 3}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 3}`).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.mergeCells(`D${totalCell + 3}:G${totalCell + 3}`);
    worksheet.getCell(`D${totalCell + 3}`).value = formatRupiah(
      invoice.invoiceAdditionals.reduce((prev, next) => prev + next.amount, 0) -
        (+getEnv('tax.env', 'TAX_AMOUNT') *
          invoice.invoiceAdditionals.reduce(
            (prev, next) => prev + next.amount,
            0,
          )) /
          100,
    );
    worksheet.getCell(`D${totalCell + 3}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 3).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.mergeCells(`A${totalCell + 4}:G${totalCell + 4}`);
    worksheet.getCell(`A${totalCell + 4}`).value =
      `Terbilang : # ${numberToTextRupiah(invoice.invoiceAdditionals.reduce((prev, next) => prev + next.amount, 0) - (+getEnv('tax.env', 'TAX_AMOUNT') * invoice.invoiceAdditionals.reduce((prev, next) => prev + next.amount, 0)) / 100).toLocaleUpperCase()}`;
    worksheet.getCell(`A${totalCell + 4}`).font = {
      bold: true,
    };
    worksheet.getRow(totalCell + 4).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.getCell(`A${totalCell + 6}`).value =
      'Kota Bangun, ' + moment(invoice.createdAt).format('DD MMMM YYYY');
    worksheet.getCell(`A${totalCell + 7}`).value = 'Hormat Kami';
    worksheet.getCell(`A${totalCell + 17}`).value = getEnv(
      'setting.env',
      'COMPANY_DIRECTURE',
    );
    worksheet.getCell(`A${totalCell + 17}`).font = {
      bold: true,
    };
    worksheet.getCell(`A${totalCell + 18}`).value = 'Direktur';
    worksheet.getCell(`A${totalCell + 19}`).value = 'Pembayaran dilakukan ke:';

    worksheet.mergeCells(`A${totalCell + 20}:D${totalCell + 20}`);
    worksheet.getCell(`A${totalCell + 20}`).value = 'Nama Bank';
    worksheet.mergeCells(`E${totalCell + 20}:G${totalCell + 20}`);
    worksheet.getCell(`E${totalCell + 20}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_NAME')}`;
    worksheet.getCell(`A${totalCell + 20}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 20}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 21}:D${totalCell + 21}`);
    worksheet.getCell(`A${totalCell + 21}`).value = 'Nama Cabang';
    worksheet.mergeCells(`E${totalCell + 21}:G${totalCell + 21}`);
    worksheet.getCell(`E${totalCell + 21}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_BRANCH')}`;
    worksheet.getCell(`A${totalCell + 21}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 21}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 22}:D${totalCell + 22}`);
    worksheet.getCell(`A${totalCell + 22}`).value = 'Nomor Rekening';
    worksheet.mergeCells(`E${totalCell + 22}:G${totalCell + 22}`);
    worksheet.getCell(`E${totalCell + 22}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_REKENING')}`;
    worksheet.getCell(`A${totalCell + 22}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 22}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`A${totalCell + 23}:D${totalCell + 23}`);
    worksheet.getCell(`A${totalCell + 23}`).value = 'Nama Pemilik Rekening';
    worksheet.mergeCells(`E${totalCell + 23}:G${totalCell + 23}`);
    worksheet.getCell(`E${totalCell + 23}`).value =
      `: ${getEnv('setting.env', 'COMPANY_BANK_OWNER')}`;
    worksheet.getCell(`A${totalCell + 23}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`E${totalCell + 23}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');

    res.send(buffer);
  }

  async exportNotification(res: Response, company: Prisma.CompanyCreateInput) {
    const notification = await this.prismaService.notification.findMany({
      where: {
        companyId: company.id,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    worksheet.getRow(1).values = ['NO', 'Judul', 'Keterangan'];
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '686D76' }, // Light gray background for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = {
        size: 12,
        bold: true,
        color: {
          argb: 'FFFFFF',
        },
      };
    });

    worksheet.columns = [
      {
        key: 'no',
        width: 5,
      },
      {
        key: 'title',
        width: 20,
      },
      {
        key: 'keterangan',
        width: 150,
      },
    ];

    const dataRows = notification.map((item) => {
      return {
        keterangan: item.body,
        title: item.title,
      };
    });
    dataRows.forEach((data, index) => {
      const row = worksheet.addRow({
        ...data,
        no: index + 1,
        keterangan: data.keterangan
          .replace(/<\/?span[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');

    res.send(buffer);
  }
}
