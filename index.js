const $status = document.getElementById("status");
const $log = document.getElementById("log");
const $teacher = document.getElementById("teacher");
const $period = document.getElementById("period");

const currentTime = () => {
    return new Date().toString().slice(0, -31);
};

let currentStatus = "in"; // Set default status to "in"

const handleNewRecord = async (serialNumber, logData, time, teacher, period) => {
    try {
        await fetch('http://localhost:3000/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serialNumber,
                logData,
                time,
                teacher,
                period,
            }),
        });
        alert('Record saved successfully');
    } catch (error) {
        console.error('Failed to save record on the server:', error);
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
        const time = currentTime();
        const { serialNumber } = e;
        const teacher = $teacher.value; // Retrieve selected teacher's name
        const period = $period.value; // Retrieve selected period
        $status.innerHTML = `<h4>Last Read</h4>${serialNumber}<br>${currentTime()}`;
        await handleNewRecord(serialNumber, currentStatus, time, teacher, period);
        console.log(e);
    };
};

document.getElementById("start-btn").onclick = (e) => {
    activateNFC();
};

document.getElementById("check-in").onchange = (e) => {
    e.target.checked && (currentStatus = "in");
};

document.getElementById("check-out").onchange = (e) => {
    e.target.checked && (currentStatus = "out");
};
