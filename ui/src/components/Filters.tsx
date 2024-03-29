import * as React from 'react';
import {HousePropertyFilter, HouseType, houseTypes} from "../services/houses";
import {Button, Checkbox, ControlGroup, FormGroup, MenuItem, RangeSlider, Slider, Tag} from "@blueprintjs/core";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";
import {MultiSelect} from "@blueprintjs/select";
import {AppState, withAppContext} from "../models";

export interface FiltersProps {
    appContext: AppState;
    initialFilter: HousePropertyFilter;
    onFiltersUpdate: (filters: HousePropertyFilter) => void;
}

export interface FiltersState {
    filters: HousePropertyFilter;
    convenienceStoreDistanceEnabled: boolean;
    storeDistanceEnabled: boolean;
    nationalRailDistanceEnabled: boolean;
    cityRailDistanceEnabled: boolean;
    surgeryDistanceEnabled: boolean;
}

const FeatureSelect = MultiSelect.ofType<string>();


export class FiltersWithAppContext extends React.Component<FiltersProps, FiltersState> {

    constructor(props: FiltersProps) {
        super(props);
        this.state = {
            filters: {
                ...props.initialFilter
            },
            convenienceStoreDistanceEnabled: props.initialFilter.max_distance_to_convenience !== undefined,
            storeDistanceEnabled: props.initialFilter.max_distance_to_store !== undefined,
            nationalRailDistanceEnabled: props.initialFilter.max_distance_to_national_rail !== undefined,
            cityRailDistanceEnabled: props.initialFilter.max_distance_to_city_rail !== undefined,
            surgeryDistanceEnabled: props.initialFilter.max_distance_to_surgery !== undefined,
        }
    }

    render() {
        const {
            filters: {
                price, property_types, num_bedrooms, max_distance_to_store, max_distance_to_convenience,
                max_distance_to_national_rail, max_distance_to_city_rail, max_distance_to_surgery
            },
            convenienceStoreDistanceEnabled, storeDistanceEnabled, nationalRailDistanceEnabled, cityRailDistanceEnabled, surgeryDistanceEnabled
        } = this.state;

        return (
            <div className={"filters"}>
                Here are some filters
                <div className={"row"}>
                    <FormGroup
                        label={"Price Range"}
                    >
                        <RangeSlider
                            min={0}
                            max={1000000}
                            value={price}
                            labelStepSize={250000}
                            stepSize={10000}
                            labelRenderer={price => (price < 1000000) ? `${(price / 1000).toFixed(0)}k` : `${(price / 1000000).toFixed(1)}M`}
                            onChange={this.handleFilterValueChange("price")}
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
                            onChange={this.handleFilterValueChange("num_bedrooms")}
                        />
                    </FormGroup>
                </div>
                <div className={"row"}>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to convenience store"}
                            checked={convenienceStoreDistanceEnabled}
                            onChange={() => this.setState((state) => ({
                                ...state,
                                convenienceStoreDistanceEnabled: !convenienceStoreDistanceEnabled
                            }))}
                        />}
                    >
                        <Slider
                            disabled={!convenienceStoreDistanceEnabled}
                            min={0}
                            max={2000}
                            value={max_distance_to_convenience}
                            labelStepSize={2500}
                            stepSize={100}
                            labelRenderer={distance => `${(distance / 1000).toFixed(1)}k`}
                            onChange={this.handleFilterValueChange("max_distance_to_convenience")}
                        />
                    </FormGroup>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to larger store"}
                            checked={storeDistanceEnabled}
                            onChange={() => this.setState((state) => ({
                                ...state,
                                storeDistanceEnabled: !storeDistanceEnabled
                            }))}
                        />}
                    >
                        <Slider
                            disabled={!storeDistanceEnabled}
                            min={0}
                            max={10000}
                            value={max_distance_to_store}
                            labelStepSize={5000}
                            stepSize={100}
                            labelRenderer={distance => `${(distance / 1000).toFixed(1)}k`}
                            onChange={this.handleFilterValueChange("max_distance_to_store")}
                        />
                    </FormGroup>
                </div>
                <div className={"row"}>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to National Rail station"}
                            checked={nationalRailDistanceEnabled}
                            onChange={() => this.setState((state) => ({
                                ...state,
                                nationalRailDistanceEnabled: !nationalRailDistanceEnabled
                            }))}
                        />}
                    >
                        <Slider
                            disabled={!nationalRailDistanceEnabled}
                            min={0}
                            max={5000}
                            value={max_distance_to_national_rail}
                            labelStepSize={2500}
                            stepSize={100}
                            labelRenderer={distance => `${(distance / 1000).toFixed(1)}k`}
                            onChange={this.handleFilterValueChange("max_distance_to_national_rail")}
                        />
                    </FormGroup>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to Metropolitan Rail   "}
                            checked={cityRailDistanceEnabled}
                            onChange={() => this.setState((state) => ({
                                ...state,
                                cityRailDistanceEnabled: !cityRailDistanceEnabled
                            }))}
                        />}
                    >
                        <Slider
                            disabled={!cityRailDistanceEnabled}
                            min={0}
                            max={10000}
                            value={max_distance_to_city_rail}
                            labelStepSize={5000}
                            stepSize={100}
                            labelRenderer={distance => `${(distance / 1000).toFixed(1)}k`}
                            onChange={this.handleFilterValueChange("max_distance_to_city_rail")}
                        />
                    </FormGroup>
                </div>
                <div className={"row"}>
                    <FormGroup
                        label={<Checkbox
                            label={"Distance to nearest NHS surgery"}
                            checked={surgeryDistanceEnabled}
                            onChange={() => this.setState((state) => ({
                                ...state,
                                surgeryDistanceEnabled: !surgeryDistanceEnabled
                            }))}
                        />}
                    >
                        <Slider
                            disabled={!surgeryDistanceEnabled}
                            min={0}
                            max={10000}
                            value={max_distance_to_surgery}
                            labelStepSize={2500}
                            stepSize={100}
                            labelRenderer={distance => `${(distance / 1000).toFixed(1)}k`}
                            onChange={this.handleFilterValueChange("max_distance_to_surgery")}
                        />
                    </FormGroup>
                    <FormGroup
                        label={"Features extracted from description"}
                    >
                        <FeatureSelect
                            popoverProps={{minimal: true}}
                            items={this.props.appContext.availableFeatures}
                            selectedItems={this.state.filters.features}
                            itemRenderer={(item, {modifiers, handleClick, index}) => (
                                <MenuItem key={index} onClick={handleClick} active={modifiers.active} text={item} />)}
                            onItemSelect={(item) => this.setState(state => ({
                                ...state,
                                filters: {
                                    ...state.filters,
                                    features: state.filters.features === undefined || !state.filters.features.includes(item)
                                        ? [...(state.filters.features || []), item]
                                        :  state.filters.features.filter((it) => it !== item)
                                }
                            }))}
                            tagRenderer={(item) => (item)}
                            tagInputProps={{onRemove: (item) => this.setState((state) => ({
                                    ...state, filters: {...state.filters, features: state.filters.features.filter((it) => it !== item)}
                            }))}}
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
            </div>
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

    handleFilterValueChange = <K extends keyof HousePropertyFilter, V extends HousePropertyFilter[K]>(key: K) => (newValue: V) => {
        this.setState((state) => ({
            ...state, filters: {...state.filters, [key]: newValue}
        }));
    }

    handleSubmitNewFilter = () => {
        const {onFiltersUpdate} = this.props;
        const {filters, convenienceStoreDistanceEnabled, storeDistanceEnabled, surgeryDistanceEnabled,
            nationalRailDistanceEnabled, cityRailDistanceEnabled} = this.state;

        onFiltersUpdate({
            ...filters,
            max_distance_to_convenience: convenienceStoreDistanceEnabled ? filters.max_distance_to_convenience : undefined,
            max_distance_to_store: storeDistanceEnabled ? filters.max_distance_to_store : undefined,
            max_distance_to_surgery: surgeryDistanceEnabled ? filters.max_distance_to_surgery : undefined,
            max_distance_to_national_rail: nationalRailDistanceEnabled ? filters.max_distance_to_national_rail : undefined,
            max_distance_to_city_rail: cityRailDistanceEnabled ? filters.max_distance_to_city_rail : undefined,
        })
    }
}

export const Filters = withAppContext(FiltersWithAppContext)