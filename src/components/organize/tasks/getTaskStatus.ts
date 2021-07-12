import dayjs from 'dayjs';
import { ZetkinTask } from '../../../types/zetkin';

export enum TASK_STATUS {
    ACTIVE= 'active',
    CLOSED= 'closed',
    DRAFT = 'draft',
    EXPIRED = 'expired',
    READY = 'ready',
}

const getTaskStatus = (task: ZetkinTask): TASK_STATUS => {
    const { published, deadline, expires } = task;

    const now = dayjs();
    const publishedDate = dayjs(published);
    const deadlineDate = dayjs(deadline);
    const expirationDate = dayjs(expires);

    const isPublished = publishedDate.isBefore(now);
    const isDeadlinePassed = deadlineDate.isBefore(now);
    const isExpired = expirationDate.isBefore(now);

    if (isExpired) {
        return TASK_STATUS.EXPIRED;
    }

    if (isDeadlinePassed) {
        return TASK_STATUS.CLOSED;
    }

    if (isPublished) {
        return TASK_STATUS.ACTIVE;
    }

    if (published && !isPublished) {
        return TASK_STATUS.READY;
    }

    return TASK_STATUS.DRAFT;
};

export default getTaskStatus;
