import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  SupportedLeagueKey,
  validateLeagueKey,
  supportedKeysList,
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
        new BadRequestException(
          `Unsupported or invalid league identifier: "${value}". Expected a valid slug corresponding to one of: ${supportedKeysList}`,
        ),
    );
  }
}
