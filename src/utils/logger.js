import log from "loglevel";

const isProd = process.env.NODE_ENV === "production";

// Set level based on environment
log.setLevel(isProd ? "silent" : "debug");

function getCallerFile() {
    const err = new Error();
    const stack = err.stack?.split("\n");
    // stack[0] = "Error"
    // stack[1] = getCallerFile (this function)
    // stack[2] = logger method (debug/info/warn/error)
    // stack[3] = actual caller — what we want
    const callerLine = stack?.[4] || "";

    // Works for both webpack bundled and vite style paths
    const match = callerLine.match(/([a-zA-Z0-9_\-]+\.(js|jsx|ts|tsx))/);
    return match ? match[1] : "unknown";
}

function formatMessage(level, args) {
    const file = getCallerFile();
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${level.toUpperCase()}] [${file}]`, ...args];
}

const logger = {
    debug: (...args) => {
        if (!isProd) log.debug(...formatMessage("debug", args));
    },
    info: (...args) => {
        if (!isProd) log.info(...formatMessage("info", args));
    },
    warn: (...args) => {
        if (!isProd) log.warn(...formatMessage("warn", args));
    },
    error: (...args) => {
        // Errors log in all environments
        log.error(...formatMessage("error", args));
    },
};

export default logger;