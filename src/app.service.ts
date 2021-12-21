import { Injectable } from '@nestjs/common';
import { MarcarHoraDto } from './dto/marcarHora.dto';

@Injectable()
export class AppService {
  marcarHora(data: MarcarHoraDto): string {
    console.log(data);
    return 'foi pooo';
  }
}
