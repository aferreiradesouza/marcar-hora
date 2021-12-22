import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarcarHoraDto } from './dto/marcarHora.dto';
import { SheetHeaders } from './config/config';
import { DateService } from './date.service';

@Controller('MarcarHora')
@ApiTags('Marcar Hora')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  @ApiOperation({ summary: 'Marcar hora' })
  marcarHora(@Body() body: MarcarHoraDto): Promise<any> {
    return this.appService.getSheet().then(async doc => {
      const name = `${DateService.format(body.dateTime, 'YYYY-MM-DD', 'MMM.YY')}`;
      const index = this.appService.getSheetByName(doc, name);
      let sheet = doc.sheetsByIndex[index];
      if (index === null) {
        sheet = await this.appService.createNewSheet(doc, name);
      }
      await sheet.setHeaderRow([SheetHeaders.Data, SheetHeaders.Entrada, SheetHeaders.SaidaAlmoco, SheetHeaders.VoltaAlmoco, SheetHeaders.Saida, SheetHeaders.HorasTrabalhadas, '', SheetHeaders.Total]);
      await this.appService.adicionarHora(sheet, body);
      return {sucesso: true};
    }).catch(err => {
      console.log(err);
      return JSON.stringify(err);
    });
  }
}
