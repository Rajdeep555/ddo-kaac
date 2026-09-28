import { useEffect } from "react";

import {
    socket,
    connectSocket,
    disconnectSocket,
} from "../services/socket";

const useSocket = ({ onNewSubmission } = {}) => {
    useEffect(() => {
        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        // Only ADMIN should connect
        if (!user || user.role !== "ADMIN") {
            return;
        }

        connectSocket();

        const handleNewSubmission = (submission) => {
            console.log(
                "New submission received:",
                submission
            );

            if (onNewSubmission) {
                onNewSubmission(submission);
            }
        };

        const handleConnect = () => {
            console.log(
                "Admin socket connected:",
                socket.id
            );
        };

        const handleDisconnect = (reason) => {
            console.log(
                "Admin socket disconnected:",
                reason
            );
        };

        const handleConnectError = (error) => {
            console.error(
                "Socket connection error:",
                error.message
            );
        };

        socket.on(
            "newSubmission",
            handleNewSubmission
        );

        socket.on("connect", handleConnect);

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );

        return () => {
            socket.off(
                "newSubmission",
                handleNewSubmission
            );

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "connect_error",
                handleConnectError
            );

            disconnectSocket();
        };
    }, [onNewSubmission]);
};

export default useSocket;