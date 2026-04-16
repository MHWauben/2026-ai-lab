import os

import dash
import requests
from dash import dcc, html, Input, Output, State
from check_location import is_point_in_geofence

COMPLIANCE_API_URL = os.environ.get("COMPLIANCE_API_URL", "http://localhost:3003")

GOVUK_CSS = "https://cdn.jsdelivr.net/npm/govuk-frontend@5.14.0/dist/govuk/govuk-frontend.min.css"
GOVUK_JS = "https://cdn.jsdelivr.net/npm/govuk-frontend@5.14.0/dist/govuk/govuk-frontend.min.js"

TAG_COLOURS = {
    "PASS": "govuk-tag--green",
    "FAIL": "govuk-tag--red",
    "NEEDS_REVIEW": "govuk-tag--yellow",
    "UNKNOWN": "govuk-tag--grey",
}


def govuk_tag(status):
    label = status.replace("_", " ")
    return html.Strong(label, className=f"govuk-tag {TAG_COLOURS.get(status, 'govuk-tag--grey')}")


def govuk_summary_list(rows):
    items = []
    for key, value in rows:
        if value is None:
            value = "N/A"
        if isinstance(value, bool):
            value = "Yes" if value else "No"
        items.append(
            html.Div(className="govuk-summary-list__row", children=[
                html.Dt(key, className="govuk-summary-list__key"),
                html.Dd(str(value), className="govuk-summary-list__value"),
            ])
        )
    return html.Dl(className="govuk-summary-list", children=items)


def build_check_card(title, check_data, pos = []):
    status = check_data.get("status", "UNKNOWN")
    details = check_data.get("details", {})
    reason = check_data.get("reason")

    rows = []
    if title == "Registration":
        make = details.get("make", "")
        model = details.get("model", "")
        if make or model:
            rows.append(("Vehicle", f"{make} {model}".strip()))
        rows.append(("Year", details.get("year")))
        rows.append(("MOT expiry", details.get("motExpiry")))
        rows.append(("AV type approval", details.get("avTypeApproval")))
        rows.append(("Insurance", details.get("insuranceStatus")))
        rows.append(("Insurer", details.get("insurer")))
    elif title == "Operator":
        rows.append(("Operator", details.get("operatorName")))
        rows.append(("Licence number", details.get("licenceNumber")))
        rows.append(("Licence expiry", details.get("licenceExpiry")))
        rows.append(("AV authorised", details.get("avAuthorised")))
    elif title == "Zone":
        loc = details.get("location", {})
        if loc:
            rows.append(("Location", f"{loc.get('lat')}, {loc.get('lng')}"))
        rows.append(("Zone", details.get("zoneName")))
        rows.append(("Zone active", details.get("zoneActive")))
        if isinstance(pos, list):
            if is_point_in_geofence(pos['lat'], pos['lon'], loc.get("polygon")):
                location_check = "Yes"
            else:
                location_check = "No"
            rows.append(("In geofenced area", location_check))


    children = [
        html.H2(className="govuk-heading-m", children=[title, " ", govuk_tag(status)]),
        govuk_summary_list(rows),
    ]

    if reason:
        children.append(
            html.Div(className="govuk-warning-text", children=[
                html.Span("!", className="govuk-warning-text__icon", **{"aria-hidden": "true"}),
                html.Strong(className="govuk-warning-text__text", children=[
                    html.Span("Warning", className="govuk-visually-hidden"),
                    reason,
                ]),
            ])
        )

    return html.Div(className="govuk-!-margin-bottom-6", children=children)


def build_compliance_display(data, pos = []):
    overall = data.get("overallStatus", "UNKNOWN")
    plate = data.get("plate", "")
    checked_at = data.get("checkedAt", "")

    if overall == "PASS":
        banner = html.Div(className="govuk-panel govuk-panel--confirmation", children=[
            html.H1(plate, className="govuk-panel__title"),
            html.Div(className="govuk-panel__body", children=[
                "Overall status: ", html.Strong("PASS"),
            ]),
        ])
    elif overall == "FAIL":
        banner = html.Div(className="govuk-error-summary", children=[
            html.Div(role="alert", children=[
                html.H2(plate, className="govuk-error-summary__title"),
                html.Div(className="govuk-error-summary__body", children=[
                    html.P(["Overall status: ", govuk_tag("FAIL")]),
                ]),
            ]),
        ])
    elif overall == "NEEDS_REVIEW":
        banner = html.Div(className="govuk-notification-banner", role="region", children=[
            html.Div(className="govuk-notification-banner__header", children=[
                html.H2("Needs review", className="govuk-notification-banner__title"),
            ]),
            html.Div(className="govuk-notification-banner__content", children=[
                html.P(className="govuk-notification-banner__heading", children=[
                    plate, " — ", govuk_tag("NEEDS_REVIEW"),
                ]),
            ]),
        ])
    else:
        banner = html.Div(className="govuk-notification-banner", role="region", children=[
            html.Div(className="govuk-notification-banner__header", children=[
                html.H2("Unknown", className="govuk-notification-banner__title"),
            ]),
            html.Div(className="govuk-notification-banner__content", children=[
                html.P(className="govuk-notification-banner__heading", children=[
                    data.get("message", "Vehicle not found in any register"),
                ]),
            ]),
        ])

    result = [
        banner,
        html.P(f"Checked at: {checked_at}",
               className="govuk-body-s govuk-!-margin-top-4"),
    ]

    checks = data.get("checks", {})
    if checks:
        result.append(html.Hr(className="govuk-section-break govuk-section-break--l govuk-section-break--visible"))
        for title, key in [("Registration", "registration"), ("Operator", "operator"), ("Zone", "zone")]:
            if key in checks:
                result.append(build_check_card(title, checks[key], pos))

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


# --- App setup ---

app = dash.Dash(
    __name__,
    external_stylesheets=[GOVUK_CSS],
    external_scripts=[GOVUK_JS],
    suppress_callback_exceptions=True,
    title="AV Licence Checker",
)

app.layout = html.Div(className="govuk-template__body", children=[

    # --- Header with Tudor Crown ---
    html.Header(className="govuk-header", role="banner", children=[
        html.Div(className="govuk-header__container govuk-width-container", children=[
            html.Div(className="govuk-header__logo", children=[
                html.A(href="/", className="govuk-header__link govuk-header__logotype", children=[
                    html.Img(
                        src="/assets/crown.svg",
                        className="govuk-header__logotype-crown",
                        height="30",
                        width="32",
                        alt="",
                    ),
                    html.Span("GOV.UK", className="govuk-header__logotype-text"),
                ]),
            ]),
        ]),
    ]),

    # --- Service navigation ---
    html.Section(className="govuk-service-navigation", children=[
        html.Div(className="govuk-width-container", children=[
            html.Div(className="govuk-service-navigation__container", children=[
                html.Span(className="govuk-service-navigation__service-name", children=[
                    html.A("AV Licence Checker", href="/", className="govuk-service-navigation__link"),
                ]),
            ]),
        ]),
    ]),

    # --- Main content ---
    html.Div(className="govuk-width-container", children=[

        # Phase banner
        html.Div(className="govuk-phase-banner", children=[
            html.P(className="govuk-phase-banner__content", children=[
                html.Strong("Alpha", className="govuk-tag govuk-phase-banner__content__tag"),
                html.Span(className="govuk-phase-banner__text", children=[
                    "This is a new service — your feedback will help us improve it.",
                ]),
            ]),
        ]),

        html.Main(className="govuk-main-wrapper", id="main-content", role="main", children=[

            html.H1("Check autonomous vehicle compliance", className="govuk-heading-xl"),

            # --- Form ---
            html.Div(className="govuk-form-group", children=[
                html.Label("Vehicle registration number", className="govuk-label govuk-label--m",
                           htmlFor="license-plate"),
                html.Div("For example, AV01XYZ", className="govuk-hint"),
                dcc.Input(
                    id="license-plate",
                    type="text",
                    className="govuk-input govuk-input--width-10 govuk-input--extra-letter-spacing",
                ),
            ]),

            # Geolocation
            dcc.Geolocation(id="geolocation"),
            html.P(id="location-info", className="govuk-body-s"),

            html.Button("Check vehicle", id="submit-btn", n_clicks=0,
                        className="govuk-button govuk-button--start",
                        **{"data-module": "govuk-button"}),

            # Demo plates
            html.Details(className="govuk-details", children=[
                html.Summary(className="govuk-details__summary", children=[
                    html.Span("Demo registration numbers", className="govuk-details__summary-text"),
                ]),
                html.Div(className="govuk-details__text", children=[
                    html.Ul(className="govuk-list govuk-list--bullet", children=[
                        html.Li("AV01XYZ — All checks pass"),
                        html.Li("AV02ABC — No operator"),
                        html.Li("AV03DEF — No operator + wrong zone"),
                        html.Li("AV04GHI — Expired MOT"),
                        html.Li("AV05JKL — Wrong zone"),
                        html.Li("AV06MNO — Needs review (insurance pending)"),
                    ]),
                ]),
            ]),

            # --- Results ---
            html.Div(id="output", className="govuk-!-margin-top-6"),

        ]),
    ]),

    # --- Footer ---
    html.Footer(className="govuk-footer", role="contentinfo", children=[
        html.Div(className="govuk-width-container", children=[
            html.Div(className="govuk-footer__meta", children=[
                html.Div(className="govuk-footer__meta-item govuk-footer__meta-item--grow", children=[
                    html.Span("Built by the AI Lab Hackathon team",
                              className="govuk-footer__licence-description"),
                ]),
            ]),
        ]),
    ]),
])


@app.callback(
    Output("location-info", "children"),
    Input("submit-btn", "n_clicks"),
    Input("geolocation", "local_date"),
    Input("geolocation", "position"),
)
def check_location(n_clicks, date, pos):
    if pos is None:
        return "Location data not available. Please allow location access and try again."
    return f"As of {date} your location was: lat {pos['lat']}, lon {pos['lon']}"


@app.callback(
    Output("output", "children"),
    Input("submit-btn", "n_clicks"),
    Input("geolocation", "position"),
    State("license-plate", "value"),
)
def check_compliance(n_clicks, pos, plate):
    if n_clicks == 0 or not plate:
        return ""

    normalised = plate.strip().replace(" ", "").upper()

    try:
        resp = requests.get(f"{COMPLIANCE_API_URL}/compliance/{normalised}", timeout=10)
    except requests.exceptions.ConnectionError:
        return error_summary("Could not connect to the compliance API. Is it running on port 3003?")
    except requests.exceptions.Timeout:
        return error_summary("The compliance API did not respond in time.")

    if resp.status_code == 400:
        errors = resp.json().get("errors", ["Enter a valid registration number"])
        return error_summary(errors[0])

    if resp.status_code >= 500:
        return error_summary("The compliance API returned an error. Try again later.")

    data = resp.json()
    return build_compliance_display(data, pos)


if __name__ == "__main__":
    app.run(debug=True, port=8050)
