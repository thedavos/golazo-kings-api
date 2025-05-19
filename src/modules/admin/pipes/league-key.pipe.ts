import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  SupportedLeagueKey,
  validateLeagueKey,
  SupportedLeagueSlugList,
} from '@modules/admin/domain/value-objects/supported-leagues.enum';

@Injectable()
export class LeagueKeyPipe
  implements PipeTransform<string, SupportedLeagueKey>
{
  transform(value: string): SupportedLeagueKey {
    if (!value) {
      throw new BadRequestException('League slug parameter is missing.');
    }

    const potentialKey = value.toUpperCase(); // 'kings-league-spain' -> 'KINGS-LEAGUE-SPAIN'

    const leagueKeyOptional = validateLeagueKey(potentialKey);

    return leagueKeyOptional.getOrThrow(
      () =>
        new BadRequestException({
          message: `Invalid league slug provided: '${value}'`,
          errors: {
            validLeagues: SupportedLeagueSlugList,
          },
        }),
    );
  }
}
