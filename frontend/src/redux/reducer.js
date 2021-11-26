export const initialState = {
  user: null,
  socket: null,
};

export const actionTypes = {
  SET_USER: "SET_USER",
  SET_SOCKET: "SET_SOCKET",
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case actionTypes.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };

    default:
      return state;
  }
};

export default reducer;
