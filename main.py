import secrets
from dataclasses import dataclass
from typing import Any, Union
from enum import Enum
from urllib.parse import urlparse
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BusID = Union[int, str]


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")
CSRF_TOKEN = secrets.token_urlsafe(24)

class PropulsionType(Enum):
    CNG = "CNG"
    BATTERY_ELECTRIC = "Battery Electric"
    TROLLEY = "Trolley"
    HYBRID_ELECTRIC = "Hybrid Electric"
    DIESEL_ELECTRIC = "Diesel Electric"
    DIESEL = "Diesel"
    HYDROGEN_FUEL_CELL = "Hydrogen Fuel Cell"

@dataclass(frozen=True)
class FleetSpec:
    year: int | None
    make: str
    model: str
    propulsion_type: PropulsionType
    series: str = ""
    length_ft: int | None = None
    display_name: str | None = None

@dataclass(frozen=True)
class FleetRange:
    lo: BusID
    hi: BusID
    spec: FleetSpec

@dataclass(frozen=True)
class AgencyFleet:
    key: str
    display_name: str
    ranges: list[FleetRange]

WMATA = [
    # Battery electric
    FleetRange(1040, 1044, FleetSpec(2025, "Nova Bus", "LFSe+", PropulsionType.BATTERY_ELECTRIC, "LFS", 40, display_name="2025 Nova Bus LFSe+")),
    FleetRange(1045, 1049, FleetSpec(2024, "New Flyer", "XE40", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 40)),
    FleetRange(1060, 1061, FleetSpec(2024, "New Flyer", "XE60", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 60)),

    # Hybrid (diesel-electric)
    FleetRange(6462, 6609, FleetSpec(2010, "New Flyer", "DE42LFA", PropulsionType.DIESEL_ELECTRIC, "Low Floor Advanced", 42)),
    FleetRange(7001, 7152, FleetSpec(2011, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)),
    FleetRange(7153, 7272, FleetSpec(2012, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)),
    FleetRange(7300, 7409, FleetSpec(2016, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)),
    FleetRange(8001, 8105, FleetSpec(2014, "NABI", "42-BRT", PropulsionType.DIESEL_ELECTRIC, "BRT", 42, display_name="2014 NABI 42-BRT")),
    FleetRange(5460, 5480, FleetSpec(2015, "New Flyer", "XDE60", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 60)),
    FleetRange(5481, 5492, FleetSpec(2018, "New Flyer", "XDE60", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 60)),

    # CNG
    FleetRange(2830, 2993, FleetSpec(2015, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(3100, 3199, FleetSpec(2018, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(3200, 3274, FleetSpec(2019, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(3275, 3349, FleetSpec(2020, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),

    # Diesel
    FleetRange(4450, 4474, FleetSpec(2019, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(4475, 4499, FleetSpec(2020, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(4500, 4598, FleetSpec(2021, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(4600, 4700, FleetSpec(2022, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(4701, 4795, FleetSpec(2023, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(5500, 5541, FleetSpec(2020, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)),
    
    # Future
    FleetRange(3350, 3374, FleetSpec(None, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(7410, 7484, FleetSpec(None, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)),
    # FleetRange(None, None, FleetSpec(None, "New Flyer", "XE35", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 35)), # prospective fleet and not yet assigned IDs
]

RIDEON = [
    FleetRange(5726, 5746, FleetSpec(2008, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(5747, 5757, FleetSpec(2009, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(5007, 5031, FleetSpec(2009, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),
    FleetRange(5758, 5758, FleetSpec(2011, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),

    FleetRange(5349, 5360, FleetSpec(2011, "GILLIG", "Hybrid", PropulsionType.HYBRID_ELECTRIC, "Low Floor", 40)),
    FleetRange(5361, 5367, FleetSpec(2012, "GILLIG", "Hybrid", PropulsionType.HYBRID_ELECTRIC, "Low Floor", 40)),

    FleetRange(5759, 5770, FleetSpec(2013, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(5032, 5059, FleetSpec(2013, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),

    FleetRange(5837, 5855, FleetSpec(2014, "GILLIG", "", PropulsionType.CNG, "Low Floor", 40)),
    FleetRange(5060, 5091, FleetSpec(2014, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),

    FleetRange(44000, 44039, FleetSpec(2016, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(44040, 44056, FleetSpec(2016, "GILLIG", "", PropulsionType.CNG, "Low Floor", 40)),
    FleetRange(42000, 42000, FleetSpec(2016, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),

    FleetRange(44057, 44072, FleetSpec(2017, "GILLIG", "BRT Plus", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(44073, 44080, FleetSpec(2017, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    
    FleetRange(44081, 44118, FleetSpec(2017, "GILLIG", "", PropulsionType.CNG, "Low Floor", 40)),
    FleetRange(44119, 44141, FleetSpec(2019, "GILLIG", "", PropulsionType.CNG, "Low Floor", 40)),
    FleetRange(44142, 44144, FleetSpec(2019, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),

    FleetRange(43000, 43003, FleetSpec(2019, "Proterra", "BE-35", PropulsionType.BATTERY_ELECTRIC, "Catalyst", 35)),

    FleetRange(44145, 44153, FleetSpec(2020, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 40)),
    FleetRange(42001, 42039, FleetSpec(2020, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),

    FleetRange(46000, 46015, FleetSpec(2019, "Nova Bus", "Artic", PropulsionType.DIESEL, "LFS", 60)),

    FleetRange(44154, 44163, FleetSpec(2022, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 40)),
    FleetRange(44164, 44175, FleetSpec(2024, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 40)),
    FleetRange(44176, 44235, FleetSpec(2025, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 40)),
]

ART = [
    # NABI 40-LFW Gen III CNG (note: two disjoint groups)
    FleetRange(5054, 5059, FleetSpec(2014, "NABI", "Gen III", PropulsionType.CNG, "LFW", 40)),
    FleetRange(5061, 5061, FleetSpec(2014, "NABI", "Gen III", PropulsionType.CNG, "LFW", 40)),
    FleetRange(5067, 5067, FleetSpec(2014, "NABI", "Gen III", PropulsionType.CNG, "LFW", 40)),
    FleetRange(5092, 5099, FleetSpec(2015, "NABI", "Gen III", PropulsionType.CNG, "LFW", 40)),

    # New Flyer XN40 (disjoint set -> split into contiguous ranges + singles)
    FleetRange(5281, 5281, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5283, 5283, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5285, 5285, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5287, 5287, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5289, 5289, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5291, 5291, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),
    FleetRange(5293, 5299, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),

    # New Flyer XN35
    FleetRange(5300, 5313, FleetSpec(2019, "New Flyer", "XN35", PropulsionType.CNG, "Xcelsior®", 35)),
    
    # New Flyer XN40 (2022)
    FleetRange(5400, 5419, FleetSpec(2022, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)),

    # GILLIG Low Floor 35ft CNG
    FleetRange(5314, 5328, FleetSpec(2024, "GILLIG", "", PropulsionType.CNG, "Low Floor", 35)),

    # GILLIG Low Floor Plus 35ft EV
    FleetRange(5329, 5329, FleetSpec(2025, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 35)),

    # GILLIG Low Floor Plus 40ft EV
    FleetRange(5420, 5422, FleetSpec(2025, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 40)),
]

NYCTA = [
    # Diesel-electric hybrid
    FleetRange(4343, 4702, FleetSpec(2009, "Orion", "07.501 HEV", PropulsionType.DIESEL_ELECTRIC, "Orion VII", 40)), # verified 
    FleetRange(9500, 9509, FleetSpec(2018, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)), # verified
    FleetRange(9416, 9499, FleetSpec(2021, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)), # verified
    FleetRange(9510, 9619, FleetSpec(2022, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)), # verified
    FleetRange(9620, 9910, FleetSpec(2021, "Nova Bus", "HEV", PropulsionType.DIESEL_ELECTRIC, "LFS", 40)), # verified

    # Diesel
    FleetRange(1202, 1289, FleetSpec(2010, "Nova Bus", "Artic (1st Generation)", PropulsionType.DIESEL, "LFS", 62)), # verified
    FleetRange(8000, 8089, FleetSpec(2011, "Nova Bus", "Diesel (3rd Generation)", PropulsionType.DIESEL, "LFS", 40)), # verified
    FleetRange(4710, 4799, FleetSpec(2012, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)), # verified

    FleetRange(7000, 7089, FleetSpec(2011, "Orion", "07.501 (3rd Generation)", PropulsionType.DIESEL, "Orion VII", 40)), # verified
    FleetRange(4810, 4899, FleetSpec(2011, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)), # verified

    FleetRange(5252, 5298, FleetSpec(2011, "Nova Bus", "Artic (1st Generation)", PropulsionType.DIESEL, "LFS", 62)), # verified
    FleetRange(5300, 5363, FleetSpec(2012, "Nova Bus", "Artic (1st Generation)", PropulsionType.DIESEL, "LFS", 62)), # verified
    FleetRange(5770, 5986, FleetSpec(2013, "Nova Bus", "Artic (1st Generation)", PropulsionType.DIESEL, "LFS", 62)), # verified

    FleetRange(7090, 7483, FleetSpec(2014, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)), # verified
    FleetRange(8090, 8503, FleetSpec(2015, "Nova Bus", "Diesel (4th Generation)", PropulsionType.DIESEL, "LFS", 40)), # verified
    FleetRange(5364, 5438, FleetSpec(2016, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)), # verified
    FleetRange(5987, 6125, FleetSpec(2017, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)), # verified
    FleetRange(5439, 5602, FleetSpec(2017, "Nova Bus", "Artic (2nd Generation)", PropulsionType.DIESEL, "LFS", 62)), # verified
    FleetRange(7484, 7850, FleetSpec(2018, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)), # verified
    FleetRange(8504, 8754, FleetSpec(2019, "Nova Bus", "Diesel (4th Generation)", PropulsionType.DIESEL, "LFS", 40)), # verified
    FleetRange(6126, 6286, FleetSpec(2019, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)), # verified
    FleetRange(8755, 8963, FleetSpec(2021, "Nova Bus", "Diesel (4th Generation)", PropulsionType.DIESEL, "LFS", 40)), # verified
    FleetRange(7851, 7989, FleetSpec(2021, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)), # verified
    FleetRange(9272, 9387, FleetSpec(2023, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)), # verified
    FleetRange(8964, 9271, FleetSpec(2023, "Nova Bus", "Diesel (4th Generation)", PropulsionType.DIESEL, "LFS", 40)), # verified
    FleetRange(6287, 6510, FleetSpec(2025, "New Flyer", "XD60", PropulsionType.DIESEL, "Xcelsior®", 60)), # verified

    # CNG
    FleetRange(185, 672, FleetSpec(2011, "New Flyer", "C40LF", PropulsionType.CNG, "Low Floor", 40)), # verified
    FleetRange(673, 810, FleetSpec(2017, "New Flyer", "XN40", PropulsionType.CNG, "Xcelsior®", 40)), # verified
    FleetRange(1000, 1109, FleetSpec(2017, "New Flyer", "XN60", PropulsionType.CNG, "Xcelsior®", 60)), # verified

    # Battery electric
    FleetRange(4950, 4964, FleetSpec(2019, "New Flyer", "XE60", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 60)), # verified
    FleetRange(4965, 5024, FleetSpec(2024, "New Flyer", "XE40", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 40)), # verified
    FleetRange(5030, 5216, FleetSpec(2026, "New Flyer", "XE40", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 40)), # verified
    FleetRange(5025, 5029, FleetSpec(2025, "Nova Bus", "LFSe+", PropulsionType.BATTERY_ELECTRIC, "LFS", 40, display_name="2025 Nova Bus LFSe+")), # verified
    FleetRange(5603, 5620, FleetSpec(2025, "New Flyer", "XE60", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 60)), # verified

    # Hydrogen fuel cell
    FleetRange(5217, 5218, FleetSpec(2025, "New Flyer", "XHE40", PropulsionType.HYDROGEN_FUEL_CELL, "Xcelsior CHARGE H2", 40)), # verified
]

NYCTA_EXPRESS_BUS = [
    FleetRange(3000, 3474, FleetSpec(2004, "Motor Coach Industries", "D4500CL", PropulsionType.DIESEL, "D-Series", 45)), # verified
    FleetRange(4306, 4306, FleetSpec(2004, "Motor Coach Industries", "D4500CL", PropulsionType.DIESEL, "D-Series", 45)), # verified
    FleetRange(2195, 2250, FleetSpec(2008, "Motor Coach Industries", "D4500CT", PropulsionType.DIESEL, "D-Series", 45)), # verified
    FleetRange(2400, 2489, FleetSpec(2011, "Prevost", "X3-45 Commuter (1st Generation)", PropulsionType.DIESEL, "X-Series", 45)), # verified
    FleetRange(2251, 2303, FleetSpec(2012, "Motor Coach Industries", "D4500CT", PropulsionType.DIESEL, "D-Series", 45)), # verified
    FleetRange(2490, 2789, FleetSpec(2014, "Prevost", "X3-45 Commuter (1st Generation)", PropulsionType.DIESEL, "X-Series", 45)), # verified
    FleetRange(1300, 1629, FleetSpec(2021, "Prevost", "X3-45 Commuter (2nd Generation)", PropulsionType.DIESEL, "X-Series", 45)), # verified
    FleetRange(1630, 2010, FleetSpec(2025, "Prevost", "X3-45 Commuter (2nd Generation)", PropulsionType.DIESEL, "X-Series", 45)), # verified
]

FAIRFAX_CONNECTOR = [
    FleetRange(9770, 9795, FleetSpec(2008, "DaimlerChrysler North America", "Next Generation", PropulsionType.DIESEL, "Orion VII", 30)),
    FleetRange(9600, 9613, FleetSpec(2009, "New Flyer", "D40LFR", PropulsionType.DIESEL, "Low Floor Restyled", 40)),
    FleetRange(9614, 9644, FleetSpec(2010, "New Flyer", "D40LFR", PropulsionType.DIESEL, "Low Floor Restyled", 40)),
    FleetRange(9645, 9675, FleetSpec(2011, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7701, 7737, FleetSpec(2011, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7738, 7753, FleetSpec(2012, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7755, 7758, FleetSpec(2012, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(3082, 3087, FleetSpec(2012, "Daimler Commercial Buses", "EPA10 BRT", PropulsionType.DIESEL_ELECTRIC, "Orion VII", 30)),
    FleetRange(9676, 9690, FleetSpec(2012, "New Flyer", "XD35", PropulsionType.DIESEL, "Xcelsior®", 35)),
    FleetRange(7759, 7777, FleetSpec(2013, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7778, 7794, FleetSpec(2014, "New Flyer", "XD35", PropulsionType.DIESEL, "Xcelsior®", 35)),
    FleetRange(7795, 7799, FleetSpec(2015, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7800, 7811, FleetSpec(2015, "New Flyer", "XD35", PropulsionType.DIESEL, "Xcelsior®", 35)),
    FleetRange(1730, 1739, FleetSpec(2017, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7812, 7815, FleetSpec(2018, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7816, 7825, FleetSpec(2018, "New Flyer", "XD35", PropulsionType.DIESEL, "Xcelsior®", 35)),
    FleetRange(7826, 7829, FleetSpec(2019, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7830, 7840, FleetSpec(2020, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7841, 7868, FleetSpec(2021, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7869, 7876, FleetSpec(2022, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7877, 7892, FleetSpec(2022, "New Flyer", "XD35", PropulsionType.DIESEL, "Xcelsior®", 35)),
    FleetRange(1000, 1007, FleetSpec(2022, "New Flyer", "XE40", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 40)),
    FleetRange(7893, 7904, FleetSpec(2023, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(1008, 1009, FleetSpec(2023, "New Flyer", "XE40", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 40)),
    FleetRange(1010, 1011, FleetSpec(2023, "New Flyer", "XE35", PropulsionType.BATTERY_ELECTRIC, "Xcelsior CHARGE NG", 35)),
    FleetRange(7905, 7950, FleetSpec(2024, "New Flyer", "XD40", PropulsionType.DIESEL, "Xcelsior®", 40)),
    FleetRange(7951, 7960, FleetSpec(2024, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),
    FleetRange(7961, 7972, FleetSpec(2025, "GILLIG", "", PropulsionType.DIESEL, "Low Floor", 29)),
    FleetRange(3000, 3011, FleetSpec(2025, "New Flyer", "XDE40", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 40)),
    FleetRange(3012, 3059, FleetSpec(2026, "New Flyer", "XDE35", PropulsionType.DIESEL_ELECTRIC, "Xcelsior®", 35)),
    FleetRange(1012, 1013, FleetSpec(2025, "GILLIG", "Plus EV", PropulsionType.BATTERY_ELECTRIC, "Low Floor", 40)),
]
    
    

AGENCY_FLEETS: dict[str, AgencyFleet] = {
    "WMATA": AgencyFleet("WMATA", "Metrobus (WMATA)", WMATA),
    "RIDEON": AgencyFleet("RIDEON", "Ride On (MCDOT)", RIDEON),
    "ART": AgencyFleet("ART", "Arlington Transit (ART)", ART),
    "FAIRFAX_CONNECTOR": AgencyFleet("FAIRFAX_CONNECTOR", "Fairfax Connector", FAIRFAX_CONNECTOR),
    "NYCTA": AgencyFleet("NYCTA", "New York City Transit Authority (NYCTA)", NYCTA),
    "NYCTA_EXPRESS": AgencyFleet("NYCTA_EXPRESS", "NYCTA Express Bus", NYCTA_EXPRESS_BUS),
}


def _coerce_bus_id(bus_id: BusID) -> int:
    try:
        return int(bus_id)
    except (TypeError, ValueError) as exc:
        raise ValueError("Bus ID must be numeric.") from exc


def find_spec(bus_id: BusID, ranges: list[FleetRange]) -> FleetSpec | None:
    numeric_bus_id = _coerce_bus_id(bus_id)
    for r in ranges:
        if r.lo <= numeric_bus_id <= r.hi:
            return r.spec
    return None

def find_suggested_agencies(bus_id: BusID, requested_agency: str) -> list[AgencyFleet]:
    numeric_bus_id = _coerce_bus_id(bus_id)
    matches: list[AgencyFleet] = []
    for key, agency in AGENCY_FLEETS.items():
        if key == requested_agency:
            continue
        for r in agency.ranges:
            if r.lo <= numeric_bus_id <= r.hi:
                matches.append(agency)
                break
    return matches


def spec_to_dict(spec: FleetSpec) -> dict[str, int | str | None]:
    return {
        "year": spec.year,
        "make": spec.make,
        "model": spec.model,
        "propulsion_type": spec.propulsion_type.value,
        "series": spec.series,
        "length_ft": spec.length_ft,
        "display_name": spec.display_name,
    }


def _extract_hostname(value: str | None) -> str | None:
    """Normalize hostnames from Origin/Referer style headers."""
    if not value:
        return None
    parsed = urlparse(value if "://" in value else f"https://{value}")
    return parsed.hostname


def verify_request(request: Request) -> None:
    """Enforce a CSRF token and same-domain origin for API calls."""
    expected_host = request.url.hostname
    request_host = _extract_hostname(request.headers.get("origin")) or _extract_hostname(
        request.headers.get("referer")
    )

    if expected_host:
        if not request_host:
            raise HTTPException(status_code=403, detail="Request origin missing.")
        if request_host != expected_host:
            raise HTTPException(status_code=403, detail="Invalid request origin.")

    header_token = request.headers.get("x-csrf-token") or request.headers.get("x-api-token")
    auth_header = request.headers.get("authorization") or ""
    bearer_token = auth_header[7:].strip() if auth_header.lower().startswith("bearer ") else None
    token = header_token or bearer_token

    if not token or not secrets.compare_digest(token, CSRF_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized request.")


@app.get("/api/fleet")
def get_fleet_spec(
    agency: str = Query(..., description="Transit agency identifier, e.g. WMATA."),
    bus_id: str = Query(..., alias="busId", description="Fleet number to look up."),
    _: None = Depends(verify_request),
) -> dict[str, Any]:
    agency_key = agency.strip().upper()
    agency_fleet = AGENCY_FLEETS.get(agency_key)
    if agency_fleet is None:
        raise HTTPException(status_code=404, detail="Agency not found.")

    try:
        spec = find_spec(bus_id, agency_fleet.ranges)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if spec is None:
        suggested_agencies = find_suggested_agencies(bus_id, agency_key)
        if suggested_agencies:
            suggestions_payload = [
                {"key": suggested.key, "display_name": suggested.display_name} for suggested in suggested_agencies
            ]
            raise HTTPException(
                status_code=404,
                detail={
                    "message": f"Bus not found in {agency_fleet.display_name}.",
                    "requested_agency": agency_key,
                    "suggested_agencies": suggestions_payload,
                    "suggested_agency": suggestions_payload[0]["key"],
                    "suggested_agency_name": suggestions_payload[0]["display_name"],
                },
            )
        raise HTTPException(status_code=404, detail="Bus not found in fleet.")

    other_agencies = find_suggested_agencies(bus_id, agency_key)
    response = {"spec": spec_to_dict(spec)}
    if other_agencies:
        response["also_found_in"] = [{"key": a.key, "display_name": a.display_name} for a in other_agencies]

    return response

def list_agencies() -> list[dict[str, str]]:
    return [{"key": agency.key, "display_name": agency.display_name} for agency in AGENCY_FLEETS.values()]

@app.get("/")
def root(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "agencies": list_agencies(),
            "csrf_token": CSRF_TOKEN,
            "allowed_domain": request.url.hostname,
        },
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
