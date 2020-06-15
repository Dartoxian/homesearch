import typing as t

from pydantic import BaseModel


class RightMoveImage(BaseModel):
    srcUrl: str
    url: str


class RightMoveImages(BaseModel):
    images: t.List[RightMoveImage]
    mainImageSrc: str
    mainMapImageSrc: str


class RightMoveLocation(BaseModel):
    latitude: float
    longitude: float


class RightMoveDisplayPrice(BaseModel):
    displayPrice: str
    displayPriceQualifier: str


class RightMovePrice(BaseModel):
    amount: int
    frequency: str
    currencyCode: str
    displayPrices: t.List[RightMoveDisplayPrice]


class RightMoveProperty(BaseModel):
    id: int
    bedrooms: int
    numberOfImages: int
    numberOfFloorplans: int
    numberOfVirtualTours: int
    summary: str
    displayAddress: str
    countryCode: str
    location: RightMoveLocation
    propertySubType: str
    listingUpdate: dict
    premiumListing: bool
    featuredProperty: bool
    price: RightMovePrice
    customer: dict
    distance: t.Optional[float]
    transactionType: str
    productLabel: dict
    commercial: bool
    development: bool
    residential: bool
    students: bool
    auction: bool
    feesApply: bool
    feesApplyText: t.Optional[str]
    displaySize: str
    showOnMap: bool
    propertyUrl: str
    contactUrl: str
    channel: str
    firstVisibleDate: str
    keywords: t.List[str]
    keywordMatchType: str
    saved: t.Optional[bool]
    hidden: t.Optional[bool]
    onlineViewingsAvailable: bool
    heading: str
    propertyImages: RightMoveImages
    displayStatus: str
    formattedBranchName: str
    addedOrReduced: str
    isRecent: bool
    formattedDistance: str
    hasBrandPlus: bool
    propertyTypeFullDescription: str
