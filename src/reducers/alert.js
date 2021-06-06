import { RemoveAlert, SetAlert } from "../actions/types";

const initialState = [];
const alert = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SetAlert:
            return [...state, payload]
        case RemoveAlert:
            return state.filter(alert => alert.id !== payload);
        default:
            return state;
    }
}

export default alert;