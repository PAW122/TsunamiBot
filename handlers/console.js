class ConsoleLogger {
  constructor() {
    if (!ConsoleLogger.instance) {
      this.logList = [];
      this.fullLogList = [];

      this.maxLogs = 1000;
      this.maxFullLogs = 10000;
      ConsoleLogger.instance = this;
    }

    return ConsoleLogger.instance;
  }
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ConsoleLogger();
    }

    return this.instance;
  }

    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString();
    }
  
    log(...args) {
      const logMessage = `[${this.getCurrentTime()}] ${args.join(' ')}`;
      this.addToLogList(logMessage);
      console.log(logMessage);
    }

    /**
     * extra logs. not displayed in console
     * @param  {...any} args 
     */
    extra(...args) {
      const logMessage = `[${this.getCurrentTime()}] ${args.join(' ')}`;
      this.addToFullLogList(logMessage);
    }
  
    warn(message) {
      const warningMessage = `[${this.getCurrentTime()}] [Warning] ${message} (at ${this.getCallerLocation()})`;
      this.addToLogList(warningMessage);
      console.warn(warningMessage);
    }
  
    error(message) {
      const errorMessage = `\x1b[31m[${this.getCurrentTime()}] [Error] ${message} (at ${this.getCallerLocation()})\x1b[0m`;
      this.addToLogList(errorMessage);
      console.error(errorMessage);
    }
  
    getCallerLocation() {
      // Pobierz informacje o miejscu wywołania
      const stack = new Error().stack.split('\n');
      const callerInfo = stack[3].trim();
      return callerInfo;
    }
  
    addToLogList(message) {
      this.logList.push(message);
  
      // Sprawdź, czy przekroczono limit wpisów, jeśli tak, usuń najstarszy wpis
      if (this.logList.length > this.maxLogs) {
        this.logList.shift();
      }

      this.addToFullLogList(message)
    }

    addToFullLogList(message) {
      this.fullLogList.push(message)

      if(this.fullLogList.length > this.maxFullLogs) {
        this.fullLogList.shift()
      }
    }
  
    getLogList() {
      return this.logList;
    }

    getFullLogList() {
      return this.fullLogList;
    }
  }
  
  module.exports = ConsoleLogger;

//   // Utwórz instancję klasy
//   const consoleLogger = new ConsoleLogger();
  
//   // Użyj naszej klasy do logowania
//   consoleLogger.log('Pierwszy log');
//   consoleLogger.warn('Ostrzeżenie');
  
//   // Pobierz listę logów
//   console.log(consoleLogger.getLogList());
  