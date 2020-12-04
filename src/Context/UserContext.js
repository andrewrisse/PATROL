import React from "react";

const UserContext = React.createContext({
    user: undefined,
    setUser: () => {}
})

export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;

export default UserContext;