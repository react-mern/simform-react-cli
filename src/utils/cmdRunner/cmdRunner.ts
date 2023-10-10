import { spawn } from "child_process";

async function cmdRunner(command: string, commandLine: string[]) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandLine, { stdio: "inherit" });

    child.on("error", err => {
      reject(err);
    });

    child.on("exit", code => {
      if (code === 0) {
        resolve("");
      } else {
        reject(
          new Error(
            `Command ${command} ${commandLine.join(
              " "
            )} exited with code ${code}`
          )
        );
      }
    });
  });
}

export default cmdRunner;
