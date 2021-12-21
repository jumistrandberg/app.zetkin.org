import { Alert } from '@material-ui/lab';
import { CheckBox } from '@material-ui/icons';
import { FormattedMessage } from 'react-intl';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

import TaskDetailsForm from 'components/forms/TaskDetailsForm';
import { ZetkinTaskRequestBody } from '../../../types/tasks';

import { ACTIONS } from '../constants';
import { useTasksResource } from 'api/tasks';
import { ActionConfig, DialogContentBaseProps } from './types';

const DialogContent: React.FunctionComponent<DialogContentBaseProps> = ({ closeDialog }) => {
    const router = useRouter();
    const { campId, orgId } = router.query as {campId: string; orgId: string};

    const queryClient = useQueryClient();
    const tasksResource = useTasksResource(orgId);
    const { mutateAsync: sendTaskRequest, isError } = tasksResource.useCreate(queryClient);

    const handleFormSubmit = async (task: ZetkinTaskRequestBody) => {
        await sendTaskRequest(task, {
            onSuccess: async (newTask) => {
                closeDialog();
                // Redirect to task page
                router.push(`/organize/${orgId}/campaigns/${campId}/calendar/tasks/${newTask.id}`);
            },
        });
    };

    return (
        <>
            { isError &&
                <Alert color="error" data-testid="error-alert">
                    <FormattedMessage id="misc.formDialog.requestError" />
                </Alert>
            }
            <TaskDetailsForm
                onCancel={ closeDialog }
                onSubmit={ handleFormSubmit }
            />
        </>
    );
};

const config = {
    icon: <CheckBox />,
    key: ACTIONS.CREATE_TASK,
    name: 'misc.tasks.forms.createTask.title',
    urlKey: 'create-task',
} as ActionConfig;

export {
    config,
    DialogContent,
};
