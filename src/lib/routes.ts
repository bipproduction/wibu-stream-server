export const pages = {
  "/": "/",
  "/stream/pengirim": "/stream/pengirim",
  "/stream/penerima": "/stream/penerima",
  "/stream/action/[userid]": ({ userid }: { userid: string }) =>
    `/stream/action/${userid}`,
};

export const apies = {
  "/api/user-create": "/api/user-create",
  "/api/update-state": "/api/update-state",
  "/api/subscribe": "/api/subscribe",
  "/api/subscribe/reset": "/api/subscribe/reset",
  "/api/stream/user": "/api/stream/user",
  "/api/stream/user/stream/[userid]": ({ userid }: { userid: string }) =>
    `/api/stream/user/stream/${userid}`,
  "/api/push": "/api/push",
};
