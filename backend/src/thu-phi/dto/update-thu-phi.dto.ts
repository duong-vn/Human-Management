import { PartialType } from '@nestjs/swagger';
import { CreateThuPhiDto } from './create-thu-phi.dto';

export class UpdateThuPhiDto extends PartialType(CreateThuPhiDto) {}
