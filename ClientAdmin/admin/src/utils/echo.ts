import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "pusher",
    key: "f088bb1daf69a8b8a297",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
    wsHost: "ws-mt1.pusher.com",
    wsPort: 443,
    forceTLS: true,
    disableStats: true,
});

export default echo;
