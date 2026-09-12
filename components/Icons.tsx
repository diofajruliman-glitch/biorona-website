import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export function SearchIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>; }
export function ArrowIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
export function WhatsAppIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.2 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.5l.7 1.6c.1.3.1.5-.1.7l-.6.7c-.2.2-.1.4 0 .6.7 1.2 1.7 2.1 3 2.8.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.7-.2l1.6.8c.3.2.5.3.5.5 0 .2 0 1.1-.5 1.6-.4.5-1.2.9-1.9 1-1 .1-2.2-.3-4-1.3-3.5-2-5.7-5.4-5.9-5.7-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-3 .3-.3.7-.4 1-.4Z" transform="scale(.68) translate(5 5)"/></svg>; }
export function SparkleIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"/></svg>; }
export function MenuIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>; }
export function XIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>; }
export function ClockIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>; }
export function MapPinIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
export function CheckIcon({ size, ...props }: Props) { return <svg {...base(size)} {...props}><path d="m5 12 4 4L19 6"/></svg>; }
