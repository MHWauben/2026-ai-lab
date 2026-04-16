#  Vehicle licensing

"Don't make autonomous vehicles the lime bikes of the future"

Problem statement: a member of the public sees an autonomous vehicle parked in London. Can we create a single checker to ensure the vehicle is compliant and registered, there is a relevant private hire operator, and it's in a location that TfL has designated as appropriate for autonomous vehicle operation? 

## User Stories

- As a TfL compliance officer, I want to verify that an autonomous vehicle is registered and compliant so that only authorized vehicles operate in London.
- As a public safety inspector, I want to confirm the vehicle has a valid private hire operator so that there is accountability for the vehicle's operations.
- As a traffic management official, I want to check that the vehicle is parked in a TfL-designated autonomous vehicle zone so that operations are restricted to approved areas.
- As a member of the public, I want to quickly identify whether a parked autonomous vehicle is legitimate so that I can report concerns if it isn't.


## Components

- Vehicle registration checker: check that the vehicle has a valid MOT. 
- Operator registration checker: check which operator has this vehicle registered to it, and that the operator has a valid private hire license
- AV operation location checker: check that the location of the AV is within London, but not within autonomous vehicle exclusion zones
- User interface: an interface where users can enter a vehicle license plate and a location, and the site then returns information whether the vehicle is compliant, the operator is licensed, and the location is appropriate