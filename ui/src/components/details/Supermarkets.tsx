import React from "react";
import {NearbySupermarket} from "../../services/houses";
import {Callout, H6, HTMLTable, Intent, Spinner} from "@blueprintjs/core";


export const Supermarkets: React.FC<{supermarkets?: NearbySupermarket[]}> = ({supermarkets}) => {
    if (!supermarkets) {
        return <Spinner />;
    }

    const filteredSupermarkets = supermarkets
        .filter(it => {
            switch (it.type) {
                case "convenience": return it.distance < 1000;
                case "store": return it.distance < 2000;
                case "supermarket": return it.distance < 2000;
                case "hypermarket": return it.distance < 10000;
            }
        });

    if (filteredSupermarkets.length == 0) {
        return (
            <div>
                <Callout intent={Intent.DANGER} title={"This property has no nearby supermarkets or convenience stores"}/>
            </div>
        )
    }

    return (
        <div>
            <H6>Supermarkets</H6>
            <HTMLTable>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Distance</th>
                </tr>
                </thead>
                <tbody>
                {filteredSupermarkets
                    .sort((a,b) => a.distance - b.distance)
                    .map((supermarket, index) => (
                        <tr key={index}>
                            <td>{supermarket.name}</td>
                            <td>{supermarket.type}</td>
                            <td>{(supermarket.distance / 1000).toFixed(2)}km</td>
                        </tr>
                    ))
                }
                </tbody>
            </HTMLTable>
        </div>
    )
}