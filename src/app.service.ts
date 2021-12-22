import { Injectable } from '@nestjs/common';
import { MarcarHoraDto } from './dto/marcarHora.dto';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { config, SheetHeaders } from './config/config';
import { DateService } from './date.service';

@Injectable()
export class AppService {
  async getSheet(): Promise<any> {
    try {
      const doc = new GoogleSpreadsheet(config.id);
      await doc.useServiceAccountAuth({
        client_email: config.client_email,
        private_key: config.private_key.replace(/\\n/g, '\n')
      })
      await doc.loadInfo();
      return doc;
    } catch (err) {
      throw new Error(err);
    }
  }

  getLastRow(rows): any {
    return rows[rows.length - 1];
  }

  getLastSheet(doc): any {
    return doc.sheetsByIndex[doc.sheetCount - 1];
  }

  obterLinhaInsert(body: MarcarHoraDto, lastRow: any, rows): { novaLinha: boolean, index: number } {
    const dateTime = DateService.parse(body.dateTime, 'YYYY-MM-DD');
    const dataLastRow = DateService.parse(lastRow[SheetHeaders.Data]);
    return {
      index: dataLastRow.isSame(dateTime, 'day') ? rows.length - 1 : rows.length,
      novaLinha: !dataLastRow.isSame(dateTime, 'day')
    }
  }

  async setInHeader(hour: string, row: any, index: number): Promise<void> {
    const headers = [SheetHeaders.Data, SheetHeaders.Entrada, SheetHeaders.SaidaAlmoco, SheetHeaders.VoltaAlmoco, SheetHeaders.Saida, SheetHeaders.HorasTrabalhadas]
    for (const item of headers) {
      if (!row[item]) {
        row[item] = hour;
        if (item !== SheetHeaders.Saida) {
          break;
        }
      }
      if (item === SheetHeaders.HorasTrabalhadas) {
        row[item] = `=(C${index + 2} - B${index + 2}) + (E${index + 2} - D${index + 2})`
      }
    }
  }

  async createNewSheet(doc, name: string): Promise<any> {
    const lastSheetCreated = doc.sheetsByIndex[doc.sheetsByIndex.length - 1];
    await lastSheetCreated.copyToSpreadsheet(config.id);
    const sheetList = await this.getSheet();
    const sheet = this.getLastSheet(sheetList);
    await sheet.updateProperties({ title: name });
    await sheet.loadCells();
    const rows = await sheet.getRows();
    const array = ' '.repeat(rows.length - 1).split(' ');
    for (let index = array.length - 1; index >= 0; index--) {
      await rows[index].delete();
    }
    const totalCell = sheet.getCellByA1('H2');
    totalCell.formula = '=SOMA(F2:F40)';
    await sheet.saveUpdatedCells();
    return sheet;
  }

  async adicionarHora(sheet, body: MarcarHoraDto): Promise<void> {
    const rows = await sheet.getRows();
    const lastRow = this.getLastRow(rows);
    const rowInsert = this.obterLinhaInsert(body, lastRow, rows);
    const hourParsed = DateService.format(body.dateTime, 'YYYY-MM-DDTHH:mm:ss', 'HH:mm');
    const dateParsed = DateService.format(body.dateTime, 'YYYY-MM-DD', 'DD/MM/YYYY');
    if (rowInsert.novaLinha) {
      await sheet.addRow({
        [SheetHeaders.Data]: dateParsed,
        [SheetHeaders.Entrada]: hourParsed})
      // await sheet.saveUpdatedCells();
    } else {
      this.setInHeader(hourParsed, rows[rowInsert.index], rowInsert.index)
      await rows[rowInsert.index].save();
    }
  }

  getSheetByName(doc, name: string): number | null {
    const allsheets = doc.sheetsByIndex.map((e, index) => {
      return {
        title: e.title,
        index,
        id: e.sheetId
      }
    });
    const sheetsSelected = allsheets.find(e => name === e.title);
    return sheetsSelected?.index ?? null;
  }

  async delay(time = 2000): Promise<void> {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  }
}
