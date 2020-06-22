import {Spinner} from "@blueprintjs/core";
import * as React from "react";

const DescriptionParagraph: React.FC<{text: string}> = ({text}) => {
    if (!text) {
        return null;
    }
    let parsed = text;
    parsed = parsed.replace(/((?:one|two|three|four|five|six|1|2|3|4|5|6)\s+bedrooms?)/i, "<b>$1</b>");
    parsed = parsed.replace(/(\W)(gas)(\W)/i, "$1<b>$2</b>$3");
    parsed = parsed.replace(/(gardens?)/i, "<b>$1</b>");
    parsed = parsed.replace(/(acres?)/i, "<b>$1</b>");
    parsed = parsed.replace(/(in\s+need\s+of)/i, "<b>$1</b>");
    parsed = parsed.replace(/(En-suite)/i, "<b>$1</b>");
    parsed = parsed.replace(/(garage)/i, "<b>$1</b>");

    return <p dangerouslySetInnerHTML={{__html: parsed}}/>
}


export const Description: React.FC<{text?: string}> = ({text}) => {
    if (!text) {
        return <Spinner />
    }
    const paragraphs = text.split(/([A-Z].*?\.)(?=[A-Z])|(?<=\w)([Dd]escription)(?=\w)|(?<=\w)(Bedroom)|(?<=\))([A-Z])/);

    return (
        <div>{paragraphs.map((it, index) => <DescriptionParagraph text={it} key={index} />)}</div>
    )
}