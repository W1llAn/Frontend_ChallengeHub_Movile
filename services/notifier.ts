//service/notifier.ts
import { Notifier, NotifierComponents } from "react-native-notifier";
import summaryContent from "./../constants/summaryContentForToast";

export type NotifierType = "success" | "info" | "warn" | "error";

const mapTypeToAlertType = (type: NotifierType) => {
  // NotifierComponents.Alert soporta: 'success' | 'error' | 'warn' | 'info'
  switch (type) {
    case "success":
      return "success";
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
    default:
      return "error";
  }
};

export const showNotifier = (
  message: string,
  type: NotifierType,
  summaryKey?: string
) => {
  const summary = summaryKey ? summaryContent(summaryKey) : type.toUpperCase();

  Notifier.showNotification({
    title: summary,
    description: message,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: mapTypeToAlertType(type),
    },
    duration: 4000,
  });
};
