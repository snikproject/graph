/** Measures elapsed duration. */
import log from "loglevel";

/** Generates a timer object that logs the elapsed time after its stop function is called.
Call example: myTimer = timer("egg cooking"); cookEgg(); timer.stop("successfull");
 * @param   name - identifies the timer
 * @returns the timer object with the stop(message) function. The message is optional.
 */
export function timer(name: string) {
	const start = new Date();
	return {
		stop: function (message?: string) {
			const end = new Date();
			const time = end.getTime() - start.getTime();
			//const f = time > config.minInfoTime ? log.debug : time > config.minDebugTime ? log.debug : log.debug;
			log.debug(name + " finished in " + time + " ms" + (message ? ` (${message})` : ""));
		},
	};
}
