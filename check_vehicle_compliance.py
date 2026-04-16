import requests


def check_vehicle_mot(license_plate: str) -> dict:
    """
    Check if a vehicle has a valid MOT using the UK MOT API.
    
    Args:
        license_plate: The vehicle's license plate (registration number)
        
    Returns:
        A dictionary containing the MOT status and details
    """
    url = "https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "registration": license_plate.upper().replace(" ", "")
    }
    print(f"Checking MOT for license plate: {license_plate}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            latest_test = data[0]
            is_valid = latest_test.get("testStatus") == "PASSED"
            
            return {
                "valid_mot": is_valid,
                "status": latest_test.get("testStatus"),
                "expiry_date": latest_test.get("expiryDate"),
                "plate": license_plate
            }
        else:
            return {
                "valid_mot": False, 
                "status": "NO_RECORDS_FOUND", 
                "plate": license_plate
                }
            
    except requests.exceptions.RequestException as e:
        return {
            "valid_mot": False, 
            "status": "ERROR", 
            "error": str(e), 
            "plate": license_plate}


# Example usage
if __name__ == "__main__":
    result = check_vehicle_mot("AB12 CDE")
    print(result)
