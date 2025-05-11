import { Option, some, none } from '@common/maybe';

export const SUPPORTED_LEAGUES = {
  ['KINGS-LEAGUE-SPAIN']: 'espana',
  ['KINGS-LEAGUE-AMERICAS']: 'americas',
  ['KINGS-LEAGUE-ITALIA']: 'italia',
  ['KINGS-LEAGUE-BRAZIL']: 'brazil',
  ['KINGS-LEAGUE-FRANCE']: 'france',
  ['KINGS-LEAGUE-GERMANY']: 'germany',
  ['QUEENS-LEAGUE-AMERICAS']: 'americas',
  ['QUEENS-LEAGUE-SPAIN']: 'espana',
};

export const supportedKeysList = Object.keys(SUPPORTED_LEAGUES).join(', ');

export type SupportedLeagueKey = keyof typeof SUPPORTED_LEAGUES;

export type SupportedLeagueInputSlug =
  | 'kings-league-spain'
  | 'kings-league-americas'
  | 'kings-league-italia'
  | 'kings-league-brazil'
  | 'kings-league-france'
  | 'kings-league-germany'
  | 'queens-league-spain'
  | 'queens-league-americas';

export function validateLeagueKey(key: string): Option<SupportedLeagueKey> {
  if (key in SUPPORTED_LEAGUES) {
    return some<SupportedLeagueKey>(key as SupportedLeagueKey);
  }

  return none<SupportedLeagueKey>();
}
