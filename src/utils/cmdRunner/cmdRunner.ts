import { spawn } from "child_process";

/**
 * Executes a command using a child process spawned with the option for standard I/O inheritance.
 * @param command - The command executor (e.g., npm, npx, yarn).
 * @param commandLine - An array representing the command and its arguments (e.g., ['create', 'vite']).
 *   The entire command, such as "npx create vite," will be executed.
 * @returns void
 */
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
