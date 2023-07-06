import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateOrderDTO {
    @ApiProperty()
    @IsNotEmpty()
    json:object;
}
