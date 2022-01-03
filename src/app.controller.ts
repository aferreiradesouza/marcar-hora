import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarcarHoraDto, ObterHoraDto } from './dto/marcarHora.dto';
import { SheetHeaders } from './config/config';
import { DateService } from './date.service';

@Controller('')
@ApiTags('Marcar Hora')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('/marcarHora')
  @ApiOperation({ summary: 'Marcar hora' })
  marcarHora(@Body() body: MarcarHoraDto): Promise<any> {
    return this.appService.getSheet().then(async doc => {
      const name = `${DateService.format(body.dateTime, 'YYYY-MM-DD', 'MMM.YY')}`;
      const index = this.appService.getSheetByName(doc, name);
      let sheet = doc.sheetsByIndex[index];
      if (index === null) {
        sheet = await this.appService.createNewSheet(doc, name);
      }
      await sheet.setHeaderRow([SheetHeaders.Data, SheetHeaders.Entrada, SheetHeaders.SaidaAlmoco, SheetHeaders.VoltaAlmoco, SheetHeaders.Saida, SheetHeaders.HorasTrabalhadas, SheetHeaders.Meta, SheetHeaders.Valor, SheetHeaders.Total]);
      await this.appService.adicionarHora(sheet, body);
      return {sucesso: true};
    }).catch(err => {
      console.log(err);
      return JSON.stringify(err);
    });
  }

  @Get('/obterUltimaHoraMarcada')
  @ApiOperation({ summary: 'Obter última hora marcada' })
  obterUltimaHoraMarcada(@Query() body: ObterHoraDto): Promise<any> {
    return this.appService.getSheet().then(async doc => {
      const lastSheet = doc.sheetsByIndex[doc.sheetsByIndex.length - 1];
      const rows = await lastSheet.getRows();
      const lastRow = this.appService.getLastRow(rows);
      const linha = this.appService.obterLinhaInsert(body, lastRow, rows);
      if (linha.novaLinha) {
        return { 
          entrada:'-',
          saidaAlmoco:'-',
          voltaAlmoco:'-',
          saida:'-'
        }
      } else {
        const row = rows[linha.index];
        return { 
          entrada: row[SheetHeaders.Entrada] || '-',
          saidaAlmoco: row[SheetHeaders.SaidaAlmoco] || '-',
          voltaAlmoco: row[SheetHeaders.VoltaAlmoco] || '-',
          saida: row[SheetHeaders.Saida] || '-'
        }
      }
    }).catch(err => {
      return JSON.stringify(err);
    });
  }
}
