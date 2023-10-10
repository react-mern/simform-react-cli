import { SupportedUILibrary } from "@/types";
import muiAdder from "./mui";
import antDesignAdder from "./antd";

export async function uiLibraryAdder(selectedLibrary: SupportedUILibrary) {
  switch (selectedLibrary) {
    case "mui":
      await muiAdder();
      break;
    case "antd":
      await antDesignAdder();
      break;
    default:
      break;
  }
}
