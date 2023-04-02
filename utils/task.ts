/**
 * 任务相关通用工具。
 */

import mitt from 'mitt';

export enum TaskStatus {
  /** 正在排队。 */
  QUEUING,
  /** 正在执行。 */
  RUNNING,
  /** 执行完成 */
  DONE,
  /** 正在等待取消。 */
  CANCEL_WAITING,
  /** 已取消。 */
  CANCELLED,
  /** 正在等待暂停。 */
  PAUSE_WAITING,
  /** 已暂停。 */
  PAUSED,
  /** 正在回滚。 */
  ROLLING_BACK,
  /** 已回滚。 */
  ROLLED_BACK,
}

/** 任务数据支持类型。 */
export type TaskData = Record<string, unknown>;

export interface TaskExecutorContext {
  /** 当前步骤数。 */
  step: number;
  /** 总步骤数。 */
  total: number;
}
export interface TaskRollbackContext<E> extends TaskExecutorContext {
  error: E;
}

/** 任务执行函数。 */
export type TaskExecutor = (ctx: TaskExecutorContext) => void | Promise<void>;
/** 任务回滚函数。 */
export type TaskRollback<E> = (ctx: TaskRollbackContext<E>) => void | Promise<void>;

export interface TaskConstructorOptions<D extends TaskData> {
  /** 任务名称。 */
  name: string;
  /** 任务数据。 */
  data: D;
  /** 任务执行函数。 */
  executor: TaskExecutor;
  /** 任务回滚函数。 */
  rollback?: TaskExecutor;
  /** 步骤数。 */
  steps: number;
}

/** 任务对象。 */
class Task<D extends TaskData> {
  /** 任务队列。 */
  static queue = ref([] as Array<Task<TaskData>>);

  constructor(options: TaskConstructorOptions<D>) {
    this.name = options.name;
    this.data = options.data;
    this.executor = options.executor;
    this.rollback = options.rollback;
    if (options.steps <= 0) { // 已完成
      this.step = this.total = 0;
      this.status = TaskStatus.DONE;
      this.event.emit('done');
    } else {
      this.step = 1;
      this.total = options.steps;
      this.status = TaskStatus.QUEUING;
    }
    Task.queue.value.push(this); // 加入队列
  }

  /** 任务事件总线。 */
  public readonly event = mitt();

  /** 任务名称。 */
  public name: string;

  /** 任务数据。 */
  public data: D;

  /** 任务状态。 */
  public status: TaskStatus;

  /** 任务执行函数。 */
  private readonly executor: TaskExecutor;

  /** 任务回滚函数。 */
  private readonly rollback?: TaskRollback<unknown>;

  /** 当前步骤数。 */
  public step: number;

  /** 总步骤数。 */
  public total: number;

  /**
   * 如果 `status` 以 `_WAITING` 结尾，则去掉结尾，返回 `true`。
   *
   * 否则，返回 `false` 。
   */
  private _updateStatus(): boolean {
    let status: TaskStatus, event: string;
    switch (this.status) { // 检查状态
      case TaskStatus.CANCEL_WAITING:
        status = TaskStatus.CANCELLED;
        event = 'cancelled';
        break;
      case TaskStatus.PAUSE_WAITING:
        status = TaskStatus.PAUSED;
        event = 'paused';
        break;
      default:
        return false;
    }
    this.status = status;
    this.event.emit(event);
    return true;
  }

  /** 依次运行每个步骤，不更改 `status` 。 */
  private async _doExecute(): Promise<void> {
    for (; this.step <= this.total; ++this.step) { // 一步一步执行
      if (this._updateStatus()) return; // 检查状态
      this.event.emit('before-step', this.step);
      await this.executor({
        step: this.step,
        total: this.total,
      });
      this.event.emit('stepped', this.step);
    }
  }

  /** 依次回滚每个步骤，不更改 `status` 。 */
  private async _doRollback<E>(error: E): Promise<void> {
    if (!this.rollback) return; // 无需回滚
    for (let i = this.step; i >= 0; --i) { // 一步一步回滚
      if (this._updateStatus()) return; // 检查状态
      try {
        await this.rollback({
          step: this.step,
          total: this.total,
          error,
        });
        this.event.emit('rollback-step-succcess'); // 成功一步
      } catch {
        this.event.emit('rollback-step-failed'); // 失败一步
      }
    }
  }

  /** 开始运行任务。 */
  public start(): void {
    this.status = TaskStatus.RUNNING;
    this.event.emit('start');
    this._doExecute().then(() => {
      if (this.status === TaskStatus.RUNNING) { // 正常运行完成
        this.status = TaskStatus.DONE;
        this.event.emit('done');
      }
    }).catch((err) => { // 运行失败
      // 需要回滚
      this.status = TaskStatus.ROLLING_BACK;
      this.event.emit('before-rollback');
      this._doRollback(err).then(() => {
        this.status = TaskStatus.ROLLED_BACK;
        this.event.emit('rolled-back');
      });
    });
  }

  /** 暂停运行任务。 */
  public async pause(): Promise<void> {
    this.status = TaskStatus.PAUSE_WAITING;
    this.event.emit('before-pause');
  }
}

/**
 * 创建一个任务。
 * @param name 任务名称
 * @param steps 步骤数
 * @param executor 执行函数
 * @param data 任务数据
 */
export function createTask<D extends TaskData>(
  name: string,
  steps: number,
  executor: TaskExecutor,
  data: D,
): Task<D>;
/**
 * 创建一个任务。
 * @param name 任务名称
 * @param steps 步骤数
 * @param executor 执行函数
 * @param rollback 回滚函数
 * @param data 任务数据
 */
export function createTask<D extends TaskData>(
  name: string,
  steps: number,
  executor: TaskExecutor,
  rollback: TaskExecutor,
  data: D,
): Task<D>;

export function createTask<D extends TaskData>(
  arg0: string,
  arg1: number,
  arg2: TaskExecutor,
  arg3: TaskExecutor | D,
  arg4?: D,
): Task<D> {
  /** 任务源对象。 */
  let task: Task<D>;
  if (arg4) {
    task = new Task({
      name: arg0,
      executor: arg2,
      rollback: arg3 as TaskExecutor,
      data: arg4,
      steps: arg1,
    });
  } else {
    task = new Task({
      name: arg0,
      executor: arg2,
      data: arg3 as D,
      steps: arg1,
    });
  }
  return task;
}
