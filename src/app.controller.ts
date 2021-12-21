import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarcarHoraDto } from './dto/marcarHora.dto';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { config } from './config/config';

@Controller('MarcarHora')
@ApiTags('Marcar Hora')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  @ApiOperation({ summary: 'Marcar hora' })
  marcarHora(@Body() body: MarcarHoraDto): Promise<string> {
    const getDoc = async () => {
      const doc = new GoogleSpreadsheet(config.id);

      await doc.useServiceAccountAuth({
        client_email: config.client_email,
        private_key: config.private_key.replace(/\\n/g, '\n')
      })
      await doc.loadInfo();
      return doc;
    }
    return getDoc().then(doc => {
      console.log(doc);
      return this.appService.marcarHora(body);
    }).catch(err => {
      return JSON.stringify(err);
    });
  }
}
