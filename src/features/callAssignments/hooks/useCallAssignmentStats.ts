import { CallAssignmentStats } from '../apiTypes';
import shouldLoad from 'core/caching/shouldLoad';
import useCallAssignment from './useCallAssignment';
import {
  IFuture,
  PlaceholderFuture,
  PromiseFuture,
  RemoteItemFuture,
  ResolvedFuture,
} from 'core/caching/futures';
import { statsLoad, statsLoaded } from '../store';
import { useApiClient, useAppDispatch, useAppSelector } from 'core/hooks';

interface UseCallAssignmentStatsReturn {
  data: CallAssignmentStats | null;
  error: unknown | null;
  hasTargets: boolean;
  isLoading: boolean;
  statusBarStatsList: { color: string; value: number }[];
}

export default function useCallAssignmentStats(
  orgId: number,
  assignmentId: number
): UseCallAssignmentStatsReturn {
  const apiClient = useApiClient();
  const dispatch = useAppDispatch();
  const callAssignmentSlice = useAppSelector((state) => state.callAssignments);
  const statsById = callAssignmentSlice.statsById;
  const { isTargeted } = useCallAssignment(orgId, assignmentId);

  const getCallAssignmentStats = () => {
    const statsItem = statsById[assignmentId];

    if (shouldLoad(statsItem)) {
      dispatch(statsLoad(assignmentId));
      const promise = apiClient
        .get<CallAssignmentStats>(
          `/api/callAssignments/targets?org=${orgId}&assignment=${assignmentId}`
        )
        .then((data: CallAssignmentStats) => {
          dispatch(statsLoaded({ ...data, id: assignmentId }));
          return data;
        });

      return new PromiseFuture(promise);
    } else {
      return new RemoteItemFuture(statsItem);
    }
  };

  const getStats = (): IFuture<CallAssignmentStats | null> => {
    if (!isTargeted) {
      return new ResolvedFuture(null);
    }

    const future = getCallAssignmentStats();
    if (future.isLoading && !future.data) {
      return new PlaceholderFuture({
        allTargets: 0,
        allocated: 0,
        blocked: 0,
        callBackLater: 0,
        calledTooRecently: 0,
        callsMade: 0,
        done: 0,
        id: assignmentId,
        missingPhoneNumber: 0,
        mostRecentCallTime: null,
        organizerActionNeeded: 0,
        queue: 0,
        ready: 0,
      });
    } else {
      return future;
    }
  };

  const hasTargets = () => {
    const statsData = getStats().data;
    if (statsData === null) {
      return false;
    }
    return statsData.blocked + statsData.ready > 0;
  };

  const getStatusBarStatsList = () => {
    const { data } = getStats();
    const hasTargets = data && data?.blocked + data?.ready > 0;
    const statusBarStatsList =
      hasTargets && data
        ? [
            {
              color: 'statusColors.orange',
              value: data.blocked,
            },
            {
              color: 'statusColors.blue',
              value: data.ready,
            },
            {
              color: 'statusColors.green',
              value: data.done,
            },
          ]
        : [
            {
              color: 'statusColors.gray',
              value: 1,
            },
            {
              color: 'statusColors.gray',
              value: 1,
            },
            {
              color: 'statusColors.gray',
              value: 1,
            },
          ];

    return statusBarStatsList;
  };

  const statsFuture = getStats();

  return {
    data: statsFuture.data,
    error: statsFuture.error,
    hasTargets: hasTargets(),
    isLoading: statsFuture.isLoading,
    statusBarStatsList: getStatusBarStatsList(),
  };
}
