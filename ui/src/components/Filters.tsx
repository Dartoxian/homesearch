import * as React from 'react';
import {HousePropertyFilter, HouseType, houseTypes} from "../services/houses";
import {Button, Card, Checkbox, ControlGroup, FormGroup, NumberRange, RangeSlider, Slider} from "@blueprintjs/core";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";

export interface FiltersProps {
    initialFilter: HousePropertyFilter;
    onFiltersUpdate: (filters: HousePropertyFilter) => void;
}

export interface FiltersState {
    filters: HousePropertyFilter;
    convenienceStoreDistanceEnabled: boolean;
    storeDistanceEnabled: boolean;
}

export class Filters extends React.Component<FiltersProps, FiltersState> {

    constructor(props: FiltersProps) {
        super(props);
        this.state = {
            filters: {
                ...props.initialFilter
            },
            convenienceStoreDistanceEnabled: props.initialFilter.max_distance_to_convenience !== undefined,
            storeDistanceEnabled: props.initialFilter.max_distance_to_store !== undefined,
        }
    }

    render() {
        const {
            filters: {price, property_types, num_bedrooms, max_distance_to_store, max_distance_to_convenience},
            convenienceStoreDistanceEnabled, storeDistanceEnabled
        } = this.state;

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
                <div className={"row"}>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to convenience store"}
                            checked={convenienceStoreDistanceEnabled}
                            onChange={() => this.setState((state) => ({...state, convenienceStoreDistanceEnabled: !convenienceStoreDistanceEnabled}))}
                        />}
                    >
                        <Slider
                            disabled={!convenienceStoreDistanceEnabled}
                            min={0}
                            max={5000}
                            value={max_distance_to_convenience}
                            labelStepSize={2500}
                            stepSize={100}
                            labelRenderer={price => `${(price/1000).toFixed(1)}k`}
                            onChange={this.handleMaxDistanceToConvenienceChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to larger store"}
                            checked={storeDistanceEnabled}
                            onChange={() => this.setState((state) => ({...state, storeDistanceEnabled: !storeDistanceEnabled}))}
                        />}
                    >
                        <Slider
                            disabled={!storeDistanceEnabled}
                            min={0}
                            max={10000}
                            value={max_distance_to_store}
                            labelStepSize={5000}
                            stepSize={100}
                            labelRenderer={price => `${(price/1000).toFixed(1)}k`}
                            onChange={this.handleMaxDistanceToStoreChange}
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
                        onClick={this.handleSubmitNewFilter}
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

    handleMaxDistanceToConvenienceChange = (newValue: number) => {
        this.setState((state) => ({
            ...state, filters: {...state.filters, max_distance_to_convenience: newValue}
        }));
    }
    handleMaxDistanceToStoreChange = (newValue: number) => {
        this.setState((state) => ({
            ...state, filters: {...state.filters, max_distance_to_store: newValue}
        }));
    }

    handleSubmitNewFilter = () => {
        const {onFiltersUpdate} = this.props;
        const {filters, convenienceStoreDistanceEnabled, storeDistanceEnabled} = this.state;

        onFiltersUpdate({
            ...filters,
            max_distance_to_convenience: convenienceStoreDistanceEnabled ? filters.max_distance_to_convenience : undefined,
            max_distance_to_store: storeDistanceEnabled ? filters.max_distance_to_store : undefined,
        })
    }
}