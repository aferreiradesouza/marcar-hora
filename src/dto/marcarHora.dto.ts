import { ApiProperty } from "@nestjs/swagger";

export class MarcarHoraDto {
    @ApiProperty()
    dateTime: string;
}