self._interval = null;
self._endTime = null;

self.onmessage = (e) => {
  const { cmd, endTime } = e.data || {};
  if (cmd === "start") {
    if (self._interval) {
      clearInterval(self._interval);
      self._interval = null;
    }
    self._endTime = endTime;
    self._interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, self._endTime - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingMs <= 0) {
        self.postMessage({ type: "done" });
        clearInterval(self._interval);
        self._interval = null;
        self._endTime = null;
      } else {
        self.postMessage({ type: "tick", remainingSec });
      }
    }, 1000);
  } else if (cmd === "stop") {
    if (self._interval) {
      clearInterval(self._interval);
      self._interval = null;
      self._endTime = null;
    }
  } else if (cmd === "clear") {
    if (self._interval) {
      clearInterval(self._interval);
      self._interval = null;
      self._endTime = null;
    }
    self.close?.();
  }
};