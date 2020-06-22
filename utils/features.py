import typing as t
import re


def get_features(description: str) -> t.List[str]:
    result = []
    if re.search(r"(?i)\b(garage|workshop)\b", description):
        result.append("Garage/Workshop")
    if re.search(r"(?i)\bgas\b", description):
        result.append("Gas")
    if re.search(r"(?i)\bgarden\b", description):
        if re.search(r"(?i)\b(large|spacious|generous)\s+garden\b", description):
            result.append("Large Garden")
        else:
            result.append("Garden")
    if re.search(r"(?i)\boff[\s-]*road\s+parking\b", description):
        result.append("Off Road Parking")
    if re.search(r"(?i)\bconservatory\b", description):
        result.append("Conservatory")
    if re.search(r"(?i)\bgreenhouse\b", description):
        result.append("Greenhouse")
    if re.search(r"(?i)\bfibre[\s-]*optic\b", description):
        result.append("Fibre Optic")
    if re.search(r"(?i)\ben[\s-]*suite\b", description):
        result.append("En-Suite")
    if re.search(r"(?i)\bbalcony\b", description):
        result.append("Balcony")
    if re.search(r"(?i)\bfreehold\b", description):
        result.append("Freehold")
    if re.search(r"(?i)\bleasehold\b", description):
        result.append("Leasehold")
    if re.search(r"(?i)\bshared[\s-]*ownership\b", description):
        result.append("Shared Ownership")
    return result
