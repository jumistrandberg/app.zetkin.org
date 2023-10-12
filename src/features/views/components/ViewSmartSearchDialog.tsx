import { FunctionComponent } from 'react';

import useViewDataTableMutations from '../hooks/useViewDataTableMutations';
import { ZetkinView } from 'features/views/components/types';
import SmartSearchDialog, {
  SmartSearchDialogProps,
} from 'features/smartSearch/components/SmartSearchDialog';

interface ViewSmartSearchDialogProps {
  onDialogClose: SmartSearchDialogProps['onDialogClose'];
  orgId: string | number;
  view: ZetkinView;
}

const ViewSmartSearchDialog: FunctionComponent<ViewSmartSearchDialogProps> = ({
  orgId,
  view,
  ...dialogProps
}) => {
  const { updateContentQuery } = useViewDataTableMutations(
    parseInt(orgId as string),
    view.id
  );

  return (
    <SmartSearchDialog
      {...dialogProps}
      onSave={(query) => {
        updateContentQuery(query);
        dialogProps.onDialogClose();
      }}
      query={view.content_query}
    />
  );
};

export default ViewSmartSearchDialog;
