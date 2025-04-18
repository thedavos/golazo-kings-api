import { Test, TestingModule } from '@nestjs/testing';
import { PresidentsService } from '../presidents.service';

describe('PresidentsService', () => {
  let service: PresidentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresidentsService],
    }).compile();

    service = module.get<PresidentsService>(PresidentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
