import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getWelcome() {
    const version = this.configService.get<string>('app.defaultApiVersion');
    const repoUrl = 'https://github.com/thedavos/golazo-kings-api';

    return {
      name: 'Golazo Kings API',
      version: version || '1',
      description:
        'API oficial de Golazo Kings para la gestión de datos de la Kings League',
      timestamp: new Date().toISOString(),
      api: {
        endpoints: {
          presidents: '/presidents',
          players: '/players',
          teams: '/teams',
          leagues: '/leagues',
        },
        documentation: '/docs',
        healthCheck: '/health',
        versionHeader: 'X-API-Version',
      },
      links: {
        repository: repoUrl,
        issues: `${repoUrl}/issues`,
        newIssue: `${repoUrl}/issues/new`,
        contributing: `${repoUrl}/blob/main/CONTRIBUTING.md`,
        pullRequests: `${repoUrl}/pulls`,
        license: `${repoUrl}/blob/main/LICENSE`,
      },
      contact: {
        author: 'David Vargas Dominguez',
        github: 'https://github.com/thedavos',
        email: 'davidvargas.d45@gmail.com',
      },
    };
  }
}
