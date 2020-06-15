import * as React from 'react';
import {HousePropertyFilter, HouseType, houseTypes} from "../services/houses";
import {Button, Card, ControlGroup, FormGroup, NumberRange, RangeSlider} from "@blueprintjs/core";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";

export interface FiltersProps {
    initialFilter: HousePropertyFilter;
    onFiltersUpdate: (filters: HousePropertyFilter) => void;
}

export interface FiltersState {
    filters: HousePropertyFilter
}

export class Filters extends React.Component<FiltersProps, FiltersState> {

    constructor(props: FiltersProps) {
        super(props);
        this.state = {
            filters: props.initialFilter
        }
    }

    render() {
        const {onFiltersUpdate} = this.props;
        const {filters: {price, property_types, num_bedrooms}} = this.state;

        return (
            <Card className={"filters"}>
                Here are some filters
                <div className={"row"}>
                    <FormGroup
                        label={"Price Range"}
                    >
                        <RangeSlider
                            min={0}
                            max={500000}
                            value={price}
                            labelStepSize={250000}
                            stepSize={10000}
                            labelRenderer={price => `${(price/1000).toFixed(0)}k`}
                            onChange={this.handlePriceRangeChanged}
                        />
                    </FormGroup>
                    <FormGroup
                        label={"Number of Bedrooms"}
                    >
                        <RangeSlider
                            min={0}
                            max={7}
                            value={num_bedrooms}
                            labelStepSize={1}
                            stepSize={1}
                            onChange={(range) => this.setState((state) => ({...state, filters: {...state.filters, num_bedrooms: range}}))}
                        />
                    </FormGroup>
                </div>
                <FormGroup
                    label={"Property Type"}
                >
                    <ControlGroup>
                        {houseTypes.map((houseType, index) => (
                            <Button
                                key={index}
                                active={property_types && property_types.find(it => it == houseType) !== undefined}
                                onClick={() => this.handlePropertyTypeClick(houseType)}
                                text={houseType}
                            />
                        ))}
                    </ControlGroup>
                </FormGroup>
                <div>
                    <Button
                        intent={Intent.SUCCESS}
                        text={"Search"}
                        onClick={() => onFiltersUpdate(this.state.filters)}
                    />
                </div>
            </Card>
        );
    }

    handlePropertyTypeClick = (propertyType: HouseType) => {
        const {filters: {property_types}} = this.state;
        if (property_types) {
            if (property_types.find(it => it === propertyType) !== undefined) {
                let filteredTypes = property_types.filter(it => it !== propertyType);
                if (filteredTypes.length === 0) {
                    filteredTypes = undefined;
                }
                this.setState((state) => ({
                    ...state, filters: {
                        ...state.filters,
                        property_types: filteredTypes
                    }
                }))
            } else {
                this.setState((state) => ({
                    ...state, filters: {
                        ...state.filters,
                        property_types: [...state.filters.property_types, propertyType]
                    }
                }))
            }
        } else {
            this.setState((state) => ({...state, filters: {...state.filters, property_types: [propertyType]}}))
        }
    }

    handlePriceRangeChanged = (range: NumberRange) => {
        this.setState((state) => ({
            ...state, filters: {...state.filters, price: range}
        }));
    }
}