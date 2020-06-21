import React from "react";
import {Card, H3, UL} from "@blueprintjs/core";

const ExA: React.FC<{href: string}> = ({href, children}) => {
    return (
        <a href={href} rel={"noreferrer noopener"} target={"_blank"}>{children}</a>
    )
}

export const About = () => {
    return (
        <div className={"About"}>
            <div className={"datasources"}>
                <H3>Data Sources:</H3>
                <UL>
                    <li>Tiles hosted by <ExA href={"https://www.maptiler.com/"}>MapTiler</ExA>, based on OpenStreetMap</li>
                    <li><ExA href={"https://www.zoopla.co.uk/"}>Zoopla</ExA> property listing data</li>
                    <li>Supermarket locations from <ExA href={"https://geolytix.co.uk/"}>Geolytix</ExA></li>
                    <li>Station data from OpenStreetMap</li>
                    <li>NHS surgery locations from <ExA href={"https://www.nhs.uk/about-us/nhs-website-datasets/"}>NHS datasets</ExA></li>
                    <li>Floodplain data from <ExA href={"https://environment.data.gov.uk/"}>DEFRA</ExA></li>
                </UL>
            </div>
        </div>
    )
}