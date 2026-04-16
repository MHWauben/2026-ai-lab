import os

import dash
import requests
from dash import dcc, html, Input, Output, State

COMPLIANCE_API_URL = os.environ.get("COMPLIANCE_API_URL", "http://localhost:3003")

STATUS_COLOURS = {
    "PASS": {"bg": "#28a745", "text": "#fff"},
    "FAIL": {"bg": "#dc3545", "text": "#fff"},
    "NEEDS_REVIEW": {"bg": "#ffc107", "text": "#212529"},
    "UNKNOWN": {"bg": "#6c757d", "text": "#fff"},
}

CARD_STYLE = {
    "border": "1px solid #dee2e6",
    "borderRadius": "8px",
    "padding": "16px",
    "marginBottom": "12px",
    "boxShadow": "0 1px 3px rgba(0,0,0,0.1)",
}


def status_badge(status):
    colours = STATUS_COLOURS.get(status, STATUS_COLOURS["UNKNOWN"])
    return html.Span(status, style={
        "backgroundColor": colours["bg"],
        "color": colours["text"],
        "padding": "4px 12px",
        "borderRadius": "4px",
        "fontWeight": "bold",
        "fontSize": "14px",
    })


def detail_row(label, value):
    if value is None:
        value = "N/A"
    if isinstance(value, bool):
        value = "Yes" if value else "No"
    return html.Div([
        html.Span(f"{label}: ", style={"fontWeight": "bold", "marginRight": "4px"}),
        html.Span(str(value)),
    ], style={"marginBottom": "4px"})


def build_check_card(title, check_data):
    status = check_data.get("status", "UNKNOWN")
    details = check_data.get("details", {})
    reason = check_data.get("reason")

    header = html.Div([
        html.Span(title, style={"fontSize": "18px", "fontWeight": "bold", "marginRight": "12px"}),
        status_badge(status),
    ], style={"marginBottom": "12px"})

    detail_rows = []
    if title == "Registration":
        make = details.get("make", "")
        model = details.get("model", "")
        if make or model:
            detail_rows.append(detail_row("Vehicle", f"{make} {model}".strip()))
        detail_rows.append(detail_row("Year", details.get("year")))
        detail_rows.append(detail_row("MOT Expiry", details.get("motExpiry")))
        detail_rows.append(detail_row("AV Type Approval", details.get("avTypeApproval")))
        detail_rows.append(detail_row("Insurance", details.get("insuranceStatus")))
        detail_rows.append(detail_row("Insurer", details.get("insurer")))
    elif title == "Operator":
        detail_rows.append(detail_row("Operator", details.get("operatorName")))
        detail_rows.append(detail_row("Licence No.", details.get("licenceNumber")))
        detail_rows.append(detail_row("Licence Expiry", details.get("licenceExpiry")))
        detail_rows.append(detail_row("AV Authorised", details.get("avAuthorised")))
    elif title == "Zone":
        loc = details.get("location", {})
        if loc:
            detail_rows.append(detail_row("Location", f"{loc.get('lat')}, {loc.get('lng')}"))
        detail_rows.append(detail_row("Zone", details.get("zoneName")))
        detail_rows.append(detail_row("Zone Active", details.get("zoneActive")))

    children = [header] + detail_rows
    if reason:
        children.append(html.Div(reason, style={"marginTop": "8px", "fontStyle": "italic", "color": "#856404"}))

    return html.Div(children, style=CARD_STYLE)


def build_compliance_display(data):
    overall = data.get("overallStatus", "UNKNOWN")
    colours = STATUS_COLOURS.get(overall, STATUS_COLOURS["UNKNOWN"])

    banner = html.Div([
        html.Div([
            html.Span(data.get("plate", ""), style={"fontSize": "24px", "fontWeight": "bold", "marginRight": "16px"}),
            status_badge(overall),
        ]),
        html.Div(f"Checked at: {data.get('checkedAt', 'N/A')}", style={"fontSize": "12px", "color": "#666", "marginTop": "4px"}),
    ], style={
        "backgroundColor": colours["bg"] + "1a",
        "border": f"2px solid {colours['bg']}",
        "borderRadius": "8px",
        "padding": "16px",
        "marginBottom": "16px",
    })

    if overall == "UNKNOWN":
        message = data.get("message", "Vehicle not found in any register")
        return html.Div([banner, html.P(message, style={"fontSize": "16px", "color": "#6c757d"})])

    checks = data.get("checks", {})
    cards = []
    for title, key in [("Registration", "registration"), ("Operator", "operator"), ("Zone", "zone")]:
        if key in checks:
            cards.append(build_check_card(title, checks[key]))

    return html.Div([banner] + cards)


app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("AV Compliance Checker"),
    html.Div([
        html.Label("License Plate:"),
        dcc.Input(
            id="license-plate",
            type="text",
            placeholder="e.g. AV01XYZ",
            style={"marginRight": "10px", "marginLeft": "8px", "padding": "6px", "fontSize": "16px"},
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
        html.Br(),
        html.Button("Check Location", id="submit-btn", n_clicks=0),
    ]),
    html.Details([
        html.Summary("Demo plates", style={"cursor": "pointer", "marginTop": "12px", "color": "#666"}),
        html.Ul([
            html.Li("AV01XYZ - All checks pass"),
            html.Li("AV02ABC - No operator"),
            html.Li("AV03DEF - No operator + wrong zone"),
            html.Li("AV04GHI - Expired MOT"),
            html.Li("AV05JKL - Wrong zone"),
            html.Li("AV06MNO - Needs review (insurance pending)"),
        ], style={"fontSize": "14px", "color": "#555"}),
    ]),
    html.Div(id="output", style={"marginTop": "20px"}),
], style={"fontFamily": "Arial, sans-serif", "maxWidth": "700px", "margin": "0 auto", "padding": "20px"})


@app.callback(
    Output("output", "children"),
    Input("submit-btn", "n_clicks"),
    State("license-plate", "value"),
)
def check_compliance(n_clicks, plate):
    if n_clicks == 0 or not plate:
        return "Enter a license plate and click Check Compliance."

    normalised = plate.strip().replace(" ", "").upper()

    try:
        resp = requests.get(f"{COMPLIANCE_API_URL}/compliance/{normalised}", timeout=10)
    except requests.exceptions.ConnectionError:
        return html.Div("Could not connect to the compliance API. Is it running?", style={"color": "red"})
    except requests.exceptions.Timeout:
        return html.Div("Compliance API timed out.", style={"color": "red"})

    if resp.status_code == 400:
        errors = resp.json().get("errors", ["Invalid plate format"])
        return html.Div(f"Invalid plate: {', '.join(errors)}", style={"color": "red"})

    if resp.status_code >= 500:
        return html.Div("Server error from compliance API.", style={"color": "red"})

    data = resp.json()
    return build_compliance_display(data)


if __name__ == "__main__":
    app.run(debug=True, port=8050)
