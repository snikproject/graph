/** Measures elapsed duration. */
import log from "loglevel";

export class Timer {
	start: Date;
	name: string;

	/** Generates a timer object that logs the elapsed time after its stop function is called.
	 * Call example: const myTimer = timer("egg cooking"); cookEgg(); timer.stop("successful");
	 * @param name - identifies the timer
	 */
	constructor(name: string) {
		this.start = new Date();
		this.name = name;
	}

	/** Stops the timer with the time and an optional message to console.
	 * @param message message that is displayed at the end of the console output
	 */
	stop(message?: string): void {
		const end = new Date();
		const time = end.getTime() - this.start.getTime();
		//const f = time > config.minInfoTime ? log.debug : time > config.minDebugTime ? log.debug : log.debug;
		log.debug(this.name + " finished in " + time + " ms" + (message ? ` (${message})` : ""));
	}
}
