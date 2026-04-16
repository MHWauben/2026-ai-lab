import dash
from dash import dcc, html, Input, Output, State
from check_location import load_geofence_data, is_point_in_geofence

load_geofence_data()

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Vehicle Location Checker"),
    html.Div([
        html.Label("License Plate:"),
        dcc.Input(
            id="license-plate",
            type="text",
            placeholder="Enter license plate",
            style={"marginRight": "10px"}
        ),
        html.Br(),
        html.Label("Latitude:"),
        dcc.Input(
            id="latitude",
            type="number",
            placeholder="Enter latitude",
            style={"marginRight": "10px"}
        ),
        html.Br(),
        html.Label("Longitude:"),
        dcc.Input(
            id="longitude",
            type="number",
            placeholder="Enter longitude",
            style={"marginRight": "10px"}
        ),
        html.Br(),
        html.Button("Check Location", id="submit-btn", n_clicks=0),
    ]),
    html.Div(id="output", style={"marginTop": "20px"})
])


@app.callback(
    Output("output", "children"),
    Input("submit-btn", "n_clicks"),
    State("license-plate", "value"),
    State("latitude", "value"),
    State("longitude", "value"),
)
def check_location(n_clicks, plate, lat, lon):
    if n_clicks == 0 or not all([plate, lat, lon]):
        return "Enter all fields and click Check Location"
    
    result = is_point_in_geofence(lat, lon)
    if result:
        geofence_text = "inside the geofence"
    else:
        geofence_text = "outside the geofence"
    return f"The coordinates you gave is {geofence_text}."


if __name__ == "__main__":
    app.run_server(debug=True)

    