import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Example } from './entities/example.entity';
import { ExamplesService } from './examples.service';

describe('ExamplesService', () => {
  let service: ExamplesService;
  let repo: jest.Mocked<Pick<Repository<Example>, 'create' | 'save' | 'findOne' | 'delete' | 'createQueryBuilder'>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamplesService,
        { provide: getRepositoryToken(Example), useValue: repo },
      ],
    }).compile();

    service = module.get(ExamplesService);
  });

  describe('create', () => {
    it('persists the entity returned by repository.create', async () => {
      const dto = { name: 'foo' };
      const entity = { id: 'uuid-1', name: 'foo' } as Example;
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toBe(entity);
    });
  });

  describe('findOne', () => {
    it('returns the entity when found', async () => {
      const entity = { id: 'uuid-1', name: 'foo' } as Example;
      repo.findOne.mockResolvedValue(entity);

      const result = await service.findOne('uuid-1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toBe(entity);
    });

    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the dto onto the existing entity and saves', async () => {
      const existing = { id: 'uuid-1', name: 'old' } as Example;
      const updated = { ...existing, name: 'new' } as Example;
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'new' });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid-1', name: 'new' }),
      );
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when delete affects zero rows', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('resolves when delete affects one row', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });
  });

  describe('list', () => {
    it('applies search filter and pagination', async () => {
      const entities = [{ id: 'uuid-1', name: 'foo' } as Example];
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([entities, 1]),
      } as unknown as SelectQueryBuilder<Example>;
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.list({ page: 1, take: 10, search: 'foo' });

      expect(qb.where).toHaveBeenCalledWith('e.name ILIKE :search', {
        search: '%foo%',
      });
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result.data).toEqual(entities);
      expect(result.totalCount).toBe(1);
    });
  });
});
