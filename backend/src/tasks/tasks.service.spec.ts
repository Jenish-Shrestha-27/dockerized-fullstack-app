import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TasksService } from './tasks.service.js';
import { Task } from './entities/task.entity.js';

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskRepository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
