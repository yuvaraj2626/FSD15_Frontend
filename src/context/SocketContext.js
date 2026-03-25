import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// ── Context ────────────────────────────────────────────────────
const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

// ── Status → human-friendly label + colour token ──────────────
const STATUS_META = {
    OPEN: { label: 'Open', emoji: '🆕', color: 'info' },
    IN_PROGRESS: { label: 'In Progress', emoji: '⏳', color: 'warning' },
    RESOLVED: { label: 'Resolved', emoji: '✅', color: 'success' },
    CLOSED: { label: 'Closed', emoji: '🔒', color: 'success' }
};

// ── Provider ──────────────────────────────────────────────────
export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Only connect when a user is logged in
        if (!isAuthenticated || !user?._id) {
            // If a previous socket exists, clean it up
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        // Create the socket connection
        const SOCKET_URL =
            process.env.REACT_APP_SOCKET_URL ||
            process.env.REACT_APP_API_URL?.replace('/api', '') ||
            'http://localhost:5000';

        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000
        });

        socketRef.current = socket;

        // ── Lifecycle events ──────────────────────────────────
        socket.on('connect', () => {
            console.log(`⚡ Socket connected: ${socket.id}`);
            setConnected(true);
            // Register this socket with the user's ID on the server
            socket.emit('register', user._id);
        });

        socket.on('disconnect', (reason) => {
            console.log(`❌ Socket disconnected: ${reason}`);
            setConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        // ── statusUpdated event ────────────────────────────────
        socket.on('statusUpdated', (payload) => {
            const { complaintId, title, newStatus } = payload;
            const meta = STATUS_META[newStatus] || { label: newStatus, emoji: '🔔', color: 'info' };

            const shortId = String(complaintId).slice(-6).toUpperCase();

            toast[meta.color === 'success' ? 'success' : meta.color === 'warning' ? 'warning' : 'info'](
                <div className="toast-notification">
                    <span className="toast-emoji">{meta.emoji}</span>
                    <div className="toast-body">
                        <strong className="toast-title">Complaint #{shortId} Updated</strong>
                        <p className="toast-detail">
                            <em>{title}</em> is now{' '}
                            <strong>{meta.label}</strong>
                        </p>
                    </div>
                </div>,
                {
                    toastId: `status-${complaintId}`, // avoid duplicate toasts
                    autoClose: 6000,
                    className: `toast-status-${newStatus.toLowerCase().replace('_', '-')}`
                }
            );
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?._id]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
