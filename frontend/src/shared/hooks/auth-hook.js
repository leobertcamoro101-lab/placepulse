import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {

  const [token, setToken] = useState(null); // or useState(null)
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, expirationDate) => { // expirationDate either we have existing expiration date or don't have, we generate new one (new Date) // is an optional parameter that can be passed in to set the token expiration date
    setToken(token);
    setUserId(uid);
    // tokenExpirationDate is same name as above useState(), but this will not override, it's only shadowed variable, you can choose any name you want, but it's better to use same name for clarity
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // set the token expiration date to 1 hour from now
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({ 
        userId: uid, 
        token: token, 
        expiration: tokenExpirationDate.toISOString() 
      }),
    ); // store the token and userId in localStorage when user logs in 
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData"); //clear the token and userId from localStorage when user logs out
  }, []);

  // useEffect(() => {
  //   if (token && userId) {
  //     const remainingTime = new Date(
  //       JSON.parse(localStorage.getItem("userData")).expiration,
  //     ).getTime() - new Date().getTime();
  //     logoutTimer = setTimeout(logout, remainingTime);
  //   } else {
  //     clearTimeout(logoutTimer);
  //   }
  // }, [token, logout, userId]);
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    //  localStorage.getItem("userData") && setToken(JSON.parse(localStorage.getItem("userData")).token);
    //  localStorage.getItem("userData") && setUserId(JSON.parse(localStorage.getItem("userData")).userId);
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      // setToken(storedData.token);
      // setUserId(storedData.userId);
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration),
      );
    }
  }, [login]);

  return { token, login, logout, userId };
}