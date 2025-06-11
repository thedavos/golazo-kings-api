import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getWelcome() {
    const version = this.configService.get<string>('app.defaultApiVersion');
    const apiPrefix = this.configService.get<string>('app.apiPrefix');
    const repoUrl = 'https://github.com/thedavos/golazo-kings-api';

    return {
      name: 'Golazo Kings API',
      version: version || '1',
      description:
        'API oficial de Golazo Kings para la gestión de datos de la Kings League',
      prefix: apiPrefix || 'api',
      endpoints: {
        presidents: '/presidents',
        players: '/players',
        teams: '/teams',
        leagues: '/leagues',
      },
      docs: '/docs',
      versionHeader: 'X-API-Version',
      links: {
        repository: repoUrl,
        issues: `${repoUrl}/issues`,
        newIssue: `${repoUrl}/issues/new`,
        contributing: `${repoUrl}/blob/main/CONTRIBUTING.md`,
        pullRequests: `${repoUrl}/pulls`,
      },
      contact: {
        author: 'David Vargas Dominguez',
        github: 'https://github.com/thedavos',
      },
    };
  }
}
