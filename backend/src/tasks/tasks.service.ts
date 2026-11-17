import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
  ) {}

  findAll(): Promise<Task[]> {
    return this.tasksRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
    });
    return this.tasksRepo.save(task);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.tasksRepo.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepo.remove(task);
  }
}