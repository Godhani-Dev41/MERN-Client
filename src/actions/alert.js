import { SetAlert } from './types';
import * as uuid from 'uuid';

export const SetAlertAction = (msg, type) => dispatch => {
    const id = uuid.v4();
    dispatch({
        type: SetAlert,
        payload: { msg, type, id }
    })
}