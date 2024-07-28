import type { IPage, PageCommand } from "@ruiapp/move-style";
import type { LinkshopAppDesignerStore } from "../stores/LinkshopAppDesignerStore";
import type { DesignerPageCommand } from "../linkshop-types";

export function sendDesignerCommand(designerPage: IPage, designerStore: LinkshopAppDesignerStore, command: DesignerPageCommand) {
  designerStore.processCommand(command);

  const targetWindow = (document.getElementById("previewIFrame") as HTMLIFrameElement).contentWindow!;
  targetWindow.postMessage(command, "*");
}

export function genRandomComponentId() {
  return createRandomString(10);
}

function createRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
