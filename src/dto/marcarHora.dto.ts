import { ApiProperty } from "@nestjs/swagger";

export class MarcarHoraDto {
    @ApiProperty()
    dateTime: string;
}

export class ObterHoraDto {
    @ApiProperty()
    dateTime: string;
}