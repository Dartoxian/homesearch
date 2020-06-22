import React from "react";

export const ExA: React.FC<{ href: string }> = ({href, children}) => {
    return (
        <a href={href} rel={"noreferrer noopener"} target={"_blank"}>{children}</a>
    )
}