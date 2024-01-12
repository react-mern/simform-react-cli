import { spawn } from "child_process";

/**
 * Executes a command using a child process spawned with the option for standard I/O inheritance.
 * @param command - The command executor (e.g., npm, npx, yarn).
 * @param commandLine - An array representing the command and its arguments (e.g., ['create', 'vite']).
 * @param showChildOutput- A boolean for whether to show output of Child Process or Not.By Default it is Set True
 *   The entire command, such as "npx create vite," will be executed.
 * @returns {Promise<void>}
 */
async function cmdRunner(command:string, commandLine:string[],showChildOutput=true) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const shell = isWindows ? true : false;
    const stdioOption = showChildOutput ? "inherit" : "ignore";

    const child = spawn(command, commandLine, { stdio: stdioOption, shell });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve("");
      } else {
        reject(
          new Error(
            `Command ${command} ${commandLine.join(
              " ",
            )} exited with code ${code}`,
          ),
        );
      }
    });
  });
}

export default cmdRunner;