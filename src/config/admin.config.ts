import { registerAs } from '@nestjs/config';

export default registerAs('admin', () => ({
  kingsLeagueBaseUrl: process.env.KINGS_LEAGUE_BASE_URL,
  queensLeagueBaseUrl: process.env.QUEENS_LEAGUE_BASE_URL,
}));
