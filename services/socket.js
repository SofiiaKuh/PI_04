import { io } from "https://esm.sh/socket.io-client";

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});


export default socket;
