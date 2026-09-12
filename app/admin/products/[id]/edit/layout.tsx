import type { ReactNode } from "react";
export const dynamicParams=false;
export function generateStaticParams(){return[{id:"_"}]}
export default function Layout({children}:{children:ReactNode}){return children}
