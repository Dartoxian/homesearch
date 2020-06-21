import React from "react";
import {HousePropertyMeta} from "../../services/houses";
import {UL} from "@blueprintjs/core";

export const KeyPoints: React.FC<{house: HousePropertyMeta}> = ({house}) => {
    return (
        <UL>
            <li><b>{house.num_bedrooms}</b> Bedrooms</li>
            <li><b>{house.house_type_full}</b></li>
            {house.num_floors !== undefined && house.num_floors > 0 && <li><b>{house.num_floors}</b> Floors</li>}
        </UL>
    );
}