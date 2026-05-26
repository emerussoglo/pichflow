// declare module "kkiapay-react" {
//   export interface KkiapayWidgetConfig {
//     amount: number;
//     api_key: string;
//     sandbox?: boolean;
//     email?: string;
//     phone?: string;
//     label?: string;
//     [key: string]: unknown;
//   }

//   type KkiapayEvent = "success" | "failed" | "close" | "open";
//   type KkiapayListener = (data: unknown) => void;

//   export interface KKiaPay {
//     openKkiapayWidget: (config: KkiapayWidgetConfig) => void;
//     addKkiapayListener: (event: KkiapayEvent, handler: KkiapayListener) => void;
//     removeKkiapayListener: (event: KkiapayEvent, handler: KkiapayListener) => void;
//   }

//   export function useKKiaPay(): KKiaPay;
// }