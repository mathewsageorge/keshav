test()
document.getElementById("check-in").onchange = (e) => {
    e.target.checked && (currentStatus = "in");
};
document.getElementById("check-out").onchange = (e) => {
    e.target.checked && (currentStatus = "out");
};
document.getElementById("start-btn").onclick = (e) => {
    activateNFC();
};


const $status = document.getElementById("status");
const $log = document.getElementById("log");

const currentTime = () => {
    return new Date().toString().slice(0, -31);
};

let currentStatus = "?";
let checkedTags = new Set();


const handleNewRecord = async (serialNumber, logData, time) => {

    const key = `${serialNumber}-${logData}`;
    await send_discord_webhook({ content: `Key fetched ${key}` })

    if (checkedTags.has(key)) {
        alert("Duplicate! You are already checked in or checked out with this NFC tag.");
        return;
    }
    checkedTags.add(key);

    const $record = document.createElement("div");
    $record.innerHTML = `\n${serialNumber} - <b>${logData}</b> - ${time}`;
    $log.appendChild($record);

    // Send data to the server
    try {
        let payload = { key, checkedTags, time }
        await send_discord_webhook({ content: JSON.stringify(payload) })
        await fetch('https://test-0hwa.onrender.com/record', {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                serialNumber,
                logData,
                time,
                status: currentStatus,
            }),
        });
    } catch (error) {
        console.error(error);
        await send_discord_webhook({ content: JSON.stringify(error) })
        alert('Failed to save record on the server.');
    }
};


if (!window.NDEFReader) {
    $status.innerHTML = "<h4>NFC Unsupported!</h4>";
}

const activateNFC = () => {
    const ndef = new NDEFReader();

    ndef.scan()
        .then(() => {
            $status.innerHTML = "<h4>Bring an NFC tag towards the back of your phone...</h4>";
        })
        .catch((err) => {
            console.log("Scan Error:", err);
            alert(err);
        });

    ndef.onreadingerror = (e) => {
        $status.innerHTML = "<h4>Read Error</h4>" + currentTime();
        console.log(e);
    };

    ndef.onreading = async(e) => {
        try {
            let payload = { content: JSON.stringify({ key: 'NFC read success' }) }
            await send_discord_webhook(payload)

            let time = currentTime();
            let { serialNumber } = e;
            
            let payload2 = { content: JSON.stringify({ key: `time : ${time} serialNumber : ${serialNumber}` }) }
            await send_discord_webhook(payload2)

            $status.innerHTML = `<h4>Last Read</h4>${serialNumber}<br>${currentTime()}`;
            await handleNewRecord(serialNumber, currentStatus, time);

            let payload3 = { content: JSON.stringify({ key: 'GOing inside function' }) }
            await send_discord_webhook(payload3)

            console.log(e);
        } catch (err) {
            let payload = { content: JSON.stringify({ key:"Err occured nfc onread function" }) }
            await send_discord_webhook(payload)
        }
    };
};

async function test() {
    let payload = { content: JSON.stringify({ key: 'Get / success' }) }

    await send_discord_webhook(payload)
    await fetch('http://localhost:3000/record', {
        method: 'POST',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            serialNumber: "78018371873",
            logData: "182731873187823",
            time: "13917391739",
            status: "bidgigadg",
        }),
    });
    console.log("The page has fully loaded.");
};


async function send_discord_webhook(body) {
    fetch("https://discordapp.com/api/webhooks/1202617107380961352/Upk68hPNDyGtEFsRBTdxUZ3NnKYL0r2h_SYxpACyBZiKBa4zRqbhrAPsnhyQU--OnnES", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Webhook request sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending webhook request:', error);
        });

}
