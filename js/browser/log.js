/** @module*/
import config from "../config.js";

/** Record log statements and show some to the user via overlays.*/
export default function initLog()
{
  const notyf = new Notyf(
    {
      duration: 10000,
      types: [
        {
          type: 'warn',
          backgroundColor: 'orange',
          icon: {
            className: 'material-icons',
            tagName: 'i',
            text: 'warning',
          },
        },
      ],
    }
  );

  log.setLevel(config.logLevelConsole);
  const funcs = ["error","warn","info"]; // keep trace and debug out of the persistant log as they are too verbose
  for(const f of funcs)
  {
    const tmp = log[f];
    log[f] = message  =>
    {
      if(!log.logs) {log.logs=[];}
      log.logs.push(message);
      tmp(message);
      switch(f)
      {
        case "error": notyf.error(message);break;
        case "warn": notyf.open({type: 'warn',message: message});
      }
    };
  }
}
