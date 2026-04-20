"use client"

import * as React from "react"
import { Country, State, City } from "country-state-city"
import { SearchableSelect } from "./searchable-select"
import { Label } from "../ui/label"

interface GeoSelectProps {
    onCountryChange: (val: string) => void
    onStateChange: (val: string) => void
    onCityChange: (val: string) => void
    countryValue?: string
    stateValue?: string
    cityValue?: string
    className?: string
}

export function GeoSelect({
    onCountryChange,
    onStateChange,
    onCityChange,
    countryValue,
    stateValue,
    cityValue,
    className
}: GeoSelectProps) {
    const countries = React.useMemo(() => Country.getAllCountries().map(c => ({ 
        value: c.isoCode, 
        label: c.name,
        flag: `https://flagcdn.com/w40/${c.isoCode.toLowerCase()}.png`
    })), [])
    
    const states = React.useMemo(() => {
        if (!countryValue) return []
        return State.getStatesOfCountry(countryValue).map(s => ({ value: s.isoCode, label: s.name }))
    }, [countryValue])

    const cities = React.useMemo(() => {
        if (!countryValue || !stateValue) return []
        return City.getCitiesOfState(countryValue, stateValue).map(c => ({ value: c.name, label: Number.isNaN(c.name) ? "Unknown" : c.name }))
    }, [countryValue, stateValue])

    return (
        <React.Fragment>
            <div className="space-y-1.5 flex-1">
                <Label className="text-xs font-medium text-slate-600">Country</Label>
                <SearchableSelect
                    options={countries}
                    value={countryValue}
                    onValueChange={(val) => {
                        onCountryChange(val)
                        onStateChange("")
                        onCityChange("")
                    }}
                    placeholder="Select Country"
                    searchPlaceholder="Search country..."
                    className="h-9 font-medium"
                />
            </div>
            <div className="space-y-1.5 flex-1">
                <Label className="text-xs font-medium text-slate-600">State <span className="text-rose-500">*</span></Label>
                <SearchableSelect
                    options={states}
                    value={stateValue}
                    onValueChange={(val) => {
                        onStateChange(val)
                        onCityChange("")
                    }}
                    placeholder={countryValue ? "Select State" : "Select Country First"}
                    searchPlaceholder="Search state..."
                    disabled={!countryValue}
                    className="h-9 font-medium"
                />
            </div>
            <div className="space-y-1.5 flex-1">
                <Label className="text-xs font-medium text-slate-600">City</Label>
                <SearchableSelect
                    options={cities}
                    value={cityValue}
                    onValueChange={onCityChange}
                    placeholder={stateValue ? "Select City" : "Select State First"}
                    searchPlaceholder="Search city..."
                    disabled={!stateValue}
                    className="h-9 font-medium"
                />
            </div>
        </React.Fragment>
    )
}
