// ======================================
// UTILITIES
// ======================================

function serverCard(server) {

    let total = server.total || 0;

    let percent = (total / 15) * 100;

    if (percent > 100) {
        percent = 100;
    }

    return `
        <div class="server-card">

            <h5>${server.name}</h5>

            <p>
                👥 Pelanggan Aktif :
                <strong>${server.active ?? 0}</strong>
            </p>

            <p>
                🍽️ Total Dilayani :
                <strong>${server.total}</strong>
            </p>

            <div class="progress">

                <div class="progress-bar bg-success"
                     role="progressbar"
                     style="width:${percent}%">

                </div>

            </div>

        </div>
    `;
}

function renderQueue(elementId, queue) {

    let html = "";

    if (queue.length === 0) {

        html = `
            <span class="text-muted">
                Tidak ada pelanggan menunggu
            </span>
        `;
    }
    else {

        queue.forEach(item => {

            html += `
                <span class="badge bg-warning text-dark badge-request">
                    ${item}
                </span>
            `;
        });
    }

    document.getElementById(elementId).innerHTML = html;
}

function renderLogs(elementId, logs) {

    const logElement =
        document.getElementById(elementId);

    logElement.innerHTML =
        logs.join("<br>");

    logElement.scrollTop =
        logElement.scrollHeight;
}

// ======================================
// ROUND ROBIN
// ======================================

async function loadRR() {

    const response =
        await fetch("/rr/state");

    const data =
        await response.json();

    document.getElementById(
        "rrServers"
    ).innerHTML =
        data.servers.map(
            serverCard
        ).join("");

    document.getElementById(
        "rrDispatch"
    ).innerText =
        data.dispatch;

    document.getElementById(
        "rrDiff"
    ).innerText =
        data.diff;

    document.getElementById(
        "rrQueueCount"
    ).innerText =
        data.queue.length;

    renderQueue(
        "rrQueue",
        data.queue
    );

    renderLogs(
        "rrLogs",
        data.logs
    );
}

async function rrAdd() {

    await fetch("/rr/add");

    loadRR();
}

async function rrDispatch() {

    await fetch("/rr/dispatch");

    loadRR();
}

async function rrReset() {

    stopRRAuto();

    await fetch("/rr/reset");

    loadRR();
}

// ======================================
// LEAST CONNECTION
// ======================================

async function loadLC() {

    const response =
        await fetch("/lc/state");

    const data =
        await response.json();

    document.getElementById(
        "lcServers"
    ).innerHTML =
        data.servers.map(
            serverCard
        ).join("");

    document.getElementById(
        "lcDispatch"
    ).innerText =
        data.dispatch;

    document.getElementById(
        "lcDiff"
    ).innerText =
        data.diff;

    document.getElementById(
        "lcQueueCount"
    ).innerText =
        data.queue.length;

    renderQueue(
        "lcQueue",
        data.queue
    );

    renderLogs(
        "lcLogs",
        data.logs
    );
}

async function lcAdd() {

    await fetch("/lc/add");

    loadLC();
}

async function lcDispatch() {

    await fetch("/lc/dispatch");

    loadLC();
}

async function lcComplete() {

    await fetch("/lc/complete");

    loadLC();
}

async function lcReset() {

    stopLCAuto();

    await fetch("/lc/reset");

    loadLC();
}

// ======================================
// COMPARISON
// ======================================

async function runComparison() {

    const response =
        await fetch("/compare/run");

    const data =
        await response.json();

    document.getElementById(
        "compareRR"
    ).innerHTML =
        data.rr.map(
            serverCard
        ).join("");

    document.getElementById(
        "compareLC"
    ).innerHTML =
        data.lc.map(
            serverCard
        ).join("");

    renderLogs(
        "compareLogs",
        data.logs
    );
}

// ======================================
// AUTO ROUND ROBIN
// ======================================

let rrAutoInterval = null;

function rrAuto() {

    const btn =
        document.getElementById(
            "rrAutoBtn"
        );

    if (rrAutoInterval !== null) {

        stopRRAuto();
        return;
    }

    btn.innerText =
        "Stop Auto";

    btn.classList.remove(
        "btn-warning"
    );

    btn.classList.add(
        "btn-danger"
    );

    rrAutoInterval =
        setInterval(async () => {

        const response =
            await fetch("/rr/state");

        const data =
            await response.json();

        if (
            data.queue.length === 0
        ) {

            stopRRAuto();
            return;
        }

        await fetch(
            "/rr/dispatch"
        );

        loadRR();

    }, 1000);
}

function stopRRAuto() {

    clearInterval(
        rrAutoInterval
    );

    rrAutoInterval = null;

    const btn =
        document.getElementById(
            "rrAutoBtn"
        );

    if (btn) {

        btn.innerText =
            "Auto";

        btn.classList.remove(
            "btn-danger"
        );

        btn.classList.add(
            "btn-warning"
        );
    }
}

// ======================================
// AUTO LEAST CONNECTION
// ======================================

let lcAutoInterval = null;

function lcAuto() {

    const btn =
        document.getElementById(
            "lcAutoBtn"
        );

    if (lcAutoInterval !== null) {

        stopLCAuto();
        return;
    }

    btn.innerText =
        "Stop Auto";

    btn.classList.remove(
        "btn-warning"
    );

    btn.classList.add(
        "btn-danger"
    );

    lcAutoInterval =
        setInterval(async () => {

        const response =
            await fetch("/lc/state");

        const data =
            await response.json();

        if (
            data.queue.length === 0
        ) {

            stopLCAuto();
            return;
        }

        await fetch(
            "/lc/dispatch"
        );

        loadLC();

    }, 1000);
}

function stopLCAuto() {

    clearInterval(
        lcAutoInterval
    );

    lcAutoInterval = null;

    const btn =
        document.getElementById(
            "lcAutoBtn"
        );

    if (btn) {

        btn.innerText =
            "Auto";

        btn.classList.remove(
            "btn-danger"
        );

        btn.classList.add(
            "btn-warning"
        );
    }
}

// ======================================
// RESET ALL
// ======================================

async function resetAll() {

    stopRRAuto();
    stopLCAuto();

    await fetch("/rr/reset");
    await fetch("/lc/reset");

    loadRR();
    loadLC();

    document.getElementById(
        "compareRR"
    ).innerHTML = "";

    document.getElementById(
        "compareLC"
    ).innerHTML = "";

    document.getElementById(
        "compareLogs"
    ).innerHTML = "";
}

// ======================================
// PAGE LOAD
// ======================================

window.onload = function () {

    loadRR();
    loadLC();
};