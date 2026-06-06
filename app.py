from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# =========================
# ROUND ROBIN STATE
# =========================

rr = {
    "servers": [
        {"id": 0, "name": "🍽️ Meja A", "active": 0, "total": 0},
        {"id": 1, "name": "🍽️ Meja B", "active": 0, "total": 0},
        {"id": 2, "name": "🍽️ Meja C", "active": 0, "total": 0}
    ],
    "queue": [],
    "pointer": 0,
    "logs": [],
    "request_counter": 0
}

# =========================
# LEAST CONNECTION STATE
# =========================

lc = {
    "servers": [
        {"id": 0, "name": "🍽️ Meja A", "active": 0, "total": 0},
        {"id": 1, "name": "🍽️ Meja B", "active": 0, "total": 0},
        {"id": 2, "name": "🍽️ Meja C", "active": 0, "total": 0}
    ],
    "queue": [],
    "logs": [],
    "request_counter": 0
}


# =========================
# UTILITIES
# =========================

def load_diff(servers):
    totals = [s["total"] for s in servers]

    if len(totals) == 0:
        return 0

    return max(totals) - min(totals)


def reset_rr():

    rr["queue"] = []
    rr["logs"] = []
    rr["pointer"] = 0
    rr["request_counter"] = 0

    for s in rr["servers"]:
        s["active"] = 0
        s["total"] = 0


def reset_lc():

    lc["queue"] = []
    lc["logs"] = []
    lc["request_counter"] = 0

    for s in lc["servers"]:
        s["active"] = 0
        s["total"] = 0


# =========================
# PAGE
# =========================

@app.route("/")
def home():
    return render_template("index.html")


# =========================
# ROUND ROBIN
# =========================

@app.route("/rr/state")
def rr_state():

    return jsonify({
        "servers": rr["servers"],
        "queue": rr["queue"],
        "logs": rr["logs"],
        "pointer": rr["pointer"],
        "dispatch": sum(s["total"] for s in rr["servers"]),
        "diff": load_diff(rr["servers"])
    })


@app.route("/rr/add")
def rr_add():

    start = rr["request_counter"] + 1

    for i in range(5):
        rr["queue"].append(f"👤 Pelanggan-{start+i}")

    rr["request_counter"] += 5

    rr["logs"].append(
        "➕ 5 pelanggan masuk ke antrian restoran"
    )

    return rr_state()


@app.route("/rr/dispatch")
def rr_dispatch():

    if len(rr["queue"]) == 0:
        return rr_state()

    customer = rr["queue"].pop(0)

    before = rr["pointer"]

    table = rr["servers"][before]

    table["active"] += 1
    table["total"] += 1

    after = (before + 1) % len(rr["servers"])

    rr["pointer"] = after

    rr["logs"].append(
        f"{customer} ditempatkan ke "
        f"{table['name']} "
        f"(giliran meja: {before} → {after})"
    )

    return rr_state()


@app.route("/rr/reset")
def rr_reset():

    reset_rr()

    return rr_state()


# =========================
# LEAST CONNECTION
# =========================

@app.route("/lc/state")
def lc_state():

    return jsonify({
        "servers": lc["servers"],
        "queue": lc["queue"],
        "logs": lc["logs"],
        "dispatch": sum(s["total"] for s in lc["servers"]),
        "diff": load_diff(lc["servers"])
    })


@app.route("/lc/add")
def lc_add():

    start = lc["request_counter"] + 1

    for i in range(5):
        lc["queue"].append(f"👤 Pelanggan-{start+i}")

    lc["request_counter"] += 5

    lc["logs"].append(
        "➕ 5 pelanggan masuk ke antrian restoran"
    )

    return lc_state()


@app.route("/lc/dispatch")
def lc_dispatch():

    if len(lc["queue"]) == 0:
        return lc_state()

    customer = lc["queue"].pop(0)

    min_active = min(
        table["active"]
        for table in lc["servers"]
    )

    candidates = [
        table
        for table in lc["servers"]
        if table["active"] == min_active
    ]

    target = random.choice(candidates)

    target["active"] += 1
    target["total"] += 1

    lc["logs"].append(
        f"{customer} ditempatkan ke "
        f"{target['name']} "
        f"(pelanggan aktif={target['active']})"
    )

    return lc_state()


@app.route("/lc/complete")
def lc_complete():

    occupied_tables = [
        s for s in lc["servers"]
        if s["active"] > 0
    ]

    if occupied_tables:

        table = random.choice(occupied_tables)

        table["active"] -= 1

        lc["logs"].append(
            f"✅ 1 pelanggan selesai makan "
            f"di {table['name']}"
        )

    return lc_state()


@app.route("/lc/reset")
def lc_reset():

    reset_lc()

    return lc_state()


# =========================
# COMPARISON
# =========================

@app.route("/compare/run")
def compare():

    rr_tables = [
        {"name": "🍽️ Meja A", "total": 0},
        {"name": "🍽️ Meja B", "total": 0},
        {"name": "🍽️ Meja C", "total": 0}
    ]

    lc_tables = [
        {"id": 0, "name": "🍽️ Meja A", "active": 0, "total": 0},
        {"id": 1, "name": "🍽️ Meja B", "active": 0, "total": 0},
        {"id": 2, "name": "🍽️ Meja C", "active": 0, "total": 0}
    ]

    logs = []
    pointer = 0

    for i in range(15):

        rr_table = rr_tables[pointer]

        rr_table["total"] += 1
        rr_name = rr_table["name"]

        pointer = (pointer + 1) % 3

        min_active = min(
            s["active"]
            for s in lc_tables
        )

        candidates = [
            s for s in lc_tables
            if s["active"] == min_active
        ]

        target = random.choice(candidates)

        target["active"] += 1
        target["total"] += 1

        lc_name = target["name"]

        logs.append(
            f"👤 Pelanggan-{i+1}: "
            f"RR → {rr_name} | "
            f"LC → {lc_name}"
        )

    return jsonify({
        "rr": rr_tables,
        "lc": lc_tables,
        "logs": logs
    })


# =========================
# MAIN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )