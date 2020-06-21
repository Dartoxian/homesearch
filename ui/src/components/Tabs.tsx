import React, {useState} from "react";
import {Button, Card} from "@blueprintjs/core";

export interface TabDetails {
    name: string;
    panel: React.ReactElement;
}

export const Tabs: React.FC<{tabs: TabDetails[]}> = ({tabs}) => {
    const [{selectedTab}, dispatch] = useState<{selectedTab?: string}>({});

    return (
        <div className={"tabs-wrapper"}>
            {selectedTab && (
                <Card className={"tab-content"}>
                {tabs.find(it => it.name === selectedTab)?.panel}
                </Card>
            )}
            <div className={"tab-controls-wrapper"}>
                <Card className={"tab-controls"}>
                    {tabs.map((tab, index) => (
                        <Button
                            key={index}
                            text={tab.name}
                            onClick={() => dispatch((state) => ({
                                ...state, selectedTab: selectedTab !== tab.name ? tab.name : undefined
                            }))}
                            active={selectedTab === tab.name}
                        />
                    ))}
                </Card>
            </div>

        </div>
    )
}