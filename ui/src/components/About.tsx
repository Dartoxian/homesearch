import React from "react";
import {H3, UL} from "@blueprintjs/core";
import {ExA} from "./common";

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

                <ExA href={"https://zoopla.co.uk"}>
                    <img src="https://www.zoopla.co.uk/static/images/mashery/powered-by-zoopla-150x73.png"
                         width="150" height="73" title="Property information powered by Zoopla" alt="Property information powered by Zoopla"
                    />
                </ExA> 
            </div>
        </div>
    )
}