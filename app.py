import os

import dash
import requests
from dash import dcc, html, Input, Output, State

COMPLIANCE_API_URL = os.environ.get("COMPLIANCE_API_URL", "http://localhost:3003")

GOVUK_CSS = "https://cdn.jsdelivr.net/npm/govuk-frontend@5.14.0/dist/govuk/govuk-frontend.min.css"
GOVUK_JS = "https://cdn.jsdelivr.net/npm/govuk-frontend@5.14.0/dist/govuk/govuk-frontend.min.js"

TAG_COLOURS = {
    "PASS": "govuk-tag--green",
    "FAIL": "govuk-tag--red",
    "NEEDS_REVIEW": "govuk-tag--yellow",
    "UNKNOWN": "govuk-tag--grey",
}


def status_badge(status):
    colours = STATUS_COLOURS.get(status, STATUS_COLOURS["UNKNOWN"])
    return html.Span(
        status,
        style={
            "backgroundColor": colours["bg"],
            "color": colours["text"],
            "padding": "4px 12px",
            "borderRadius": "4px",
            "fontWeight": "bold",
            "fontSize": "14px",
        },
    )


def detail_row(label, value):
    if value is None:
        value = "N/A"
    if isinstance(value, bool):
        value = "Yes" if value else "No"
    return html.Div(
        [
            html.Span(f"{label}: ", style={"fontWeight": "bold", "marginRight": "4px"}),
            html.Span(str(value)),
        ],
        style={"marginBottom": "4px"},
    )


def build_check_card(title, check_data):
    status = check_data.get("status", "UNKNOWN")
    details = check_data.get("details", {})
    reason = check_data.get("reason")

<<<<<<< HEAD
    header = html.Div(
        [
            html.Span(
                title,
                style={"fontSize": "18px", "fontWeight": "bold", "marginRight": "12px"},
            ),
            status_badge(status),
        ],
        style={"marginBottom": "12px"},
    )

    detail_rows = []
=======
    rows = []
>>>>>>> e15378a (update with screenshot)
    if title == "Registration":
        make = details.get("make", "")
        model = details.get("model", "")
        if make or model:
            detail_rows.append(detail_row("Vehicle", f"{make} {model}".strip()))
        detail_rows.append(detail_row("Year", details.get("year")))
        detail_rows.append(detail_row("MOT Expiry", details.get("motExpiry")))
        detail_rows.append(
            detail_row("AV Type Approval", details.get("avTypeApproval"))
        )
        detail_rows.append(detail_row("Insurance", details.get("insuranceStatus")))
        detail_rows.append(detail_row("Insurer", details.get("insurer")))
    elif title == "Operator":
        rows.append(("Operator", details.get("operatorName")))
        rows.append(("Licence number", details.get("licenceNumber")))
        rows.append(("Licence expiry", details.get("licenceExpiry")))
        rows.append(("AV authorised", details.get("avAuthorised")))
    elif title == "Zone":
        loc = details.get("location", {})
        if loc:
            detail_rows.append(
                detail_row("Location", f"{loc.get('lat')}, {loc.get('lng')}")
            )
        detail_rows.append(detail_row("Zone", details.get("zoneName")))
        detail_rows.append(detail_row("Zone Active", details.get("zoneActive")))

    if reason:
        children.append(
            html.Div(
                reason,
                style={"marginTop": "8px", "fontStyle": "italic", "color": "#856404"},
            )
        )

    return html.Div(className="govuk-!-margin-bottom-6", children=children)


def build_compliance_display(data):
    overall = data.get("overallStatus", "UNKNOWN")
    plate = data.get("plate", "")
    checked_at = data.get("checkedAt", "")

    banner = html.Div(
        [
            html.Div(
                [
                    html.Span(
                        data.get("plate", ""),
                        style={
                            "fontSize": "24px",
                            "fontWeight": "bold",
                            "marginRight": "16px",
                        },
                    ),
                    status_badge(overall),
                ]
            ),
            html.Div(
                f"Checked at: {data.get('checkedAt', 'N/A')}",
                style={"fontSize": "12px", "color": "#666", "marginTop": "4px"},
            ),
        ],
        style={
            "backgroundColor": colours["bg"] + "1a",
            "border": f"2px solid {colours['bg']}",
            "borderRadius": "8px",
            "padding": "16px",
            "marginBottom": "16px",
        },
    )

    if overall == "UNKNOWN":
        message = data.get("message", "Vehicle not found in any register")
        return html.Div(
            [banner, html.P(message, style={"fontSize": "16px", "color": "#6c757d"})]
        )

    checks = data.get("checks", {})
    cards = []
    for title, key in [
        ("Registration", "registration"),
        ("Operator", "operator"),
        ("Zone", "zone"),
    ]:
        if key in checks:
            cards.append(build_check_card(title, checks[key]))

    return html.Div(result)


def error_summary(message):
    return html.Div(className="govuk-error-summary", children=[
        html.Div(role="alert", children=[
            html.H2("There is a problem", className="govuk-error-summary__title"),
            html.Div(className="govuk-error-summary__body", children=[
                html.Ul(className="govuk-list govuk-error-summary__list", children=[
                    html.Li(message),
                ]),
            ]),
        ]),
    ])

app.layout = html.Div(
    [
        html.H1("AV Compliance Checker"),
        html.Div(
            [
                html.Label("License Plate:"),
                dcc.Input(
                    id="license-plate",
                    type="text",
                    placeholder="e.g. AV01XYZ",
                    style={
                        "marginRight": "10px",
                        "marginLeft": "8px",
                        "padding": "6px",
                        "fontSize": "16px",
                    },
                ),
                html.Br(),
                dcc.Geolocation(id="geolocation"),
                html.Button("Check Vehicle", id="submit-btn", n_clicks=0),
            ]
        ),
        html.Label(id="location-info"),
        html.Details(
            [
                html.Summary(
                    "Demo plates",
                    style={"cursor": "pointer", "marginTop": "12px", "color": "#666"},
                ),
                html.Ul(
                    [
                        html.Li("AV01XYZ - All checks pass"),
                        html.Li("AV02ABC - No operator"),
                        html.Li("AV03DEF - No operator + wrong zone"),
                        html.Li("AV04GHI - Expired MOT"),
                        html.Li("AV05JKL - Wrong zone"),
                        html.Li("AV06MNO - Needs review (insurance pending)"),
                    ],
                    style={"fontSize": "14px", "color": "#555"},
                ),
            ]
        ),
        html.Div(id="output", style={"marginTop": "20px"}),
    ],
    style={
        "fontFamily": "Arial, sans-serif",
        "maxWidth": "700px",
        "margin": "0 auto",
        "padding": "20px",
    },
)

@app.callback(
        Output("location-info", "children"),
        Input("submit-btn", "n_clicks"),
        Input("geolocation", "local_date"),
        Input("geolocation", "position"),
)
def check_location(n_clicks, date, pos):
    if pos is None:
        return "Location data not available. Please allow location access and try again."

    return f"As of {date} your location was: lat {pos['lat']},lon {pos['lon']}"


@app.callback(
    Output("output", "children"),
    Input("submit-btn", "n_clicks"),
    State("license-plate", "value"),
)
def check_compliance(n_clicks, plate):
    if n_clicks == 0 or not plate:
        return ""

    normalised = plate.strip().replace(" ", "").upper()

    try:
        resp = requests.get(f"{COMPLIANCE_API_URL}/compliance/{normalised}", timeout=10)
    except requests.exceptions.ConnectionError:
        return html.Div(
            "Could not connect to the compliance API. Is it running?",
            style={"color": "red"},
        )
    except requests.exceptions.Timeout:
        return error_summary("The compliance API did not respond in time.")

    if resp.status_code == 400:
        errors = resp.json().get("errors", ["Enter a valid registration number"])
        return error_summary(errors[0])

    if resp.status_code >= 500:
        return error_summary("The compliance API returned an error. Try again later.")

    data = resp.json()
    return build_compliance_display(data)


if __name__ == "__main__":
    app.run(debug=True, port=8050)
