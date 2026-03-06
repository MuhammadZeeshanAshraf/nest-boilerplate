import { IRead } from './read.interface';
import { IWrite } from './write.interface';

export interface IBaseRepository<T> extends IWrite<T>, IRead<T> {}
