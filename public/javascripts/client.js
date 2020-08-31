//uses socket.io
const socket = io();

socket.on('serverMsg', data => {
    console.log(data.msg);
});

socket.on('sit', data => {


    for (let id of ["p1", "p2"]) {
        let btn = document.getElementById(id);

        btn.disabled = !data[id];

        if (id === data.id) {

            if (data.owner) {
                btn.innerText = btn.innerText.replace("(Open)", "(You)");
            } else {
                btn.innerText = btn.innerText.replace("(Open)", "(Closed)");
            }
        }
    }



});

socket.on('updateSeats', data => {
    let btn1 = document.getElementById("p1")
    btn1.disabled = !data.p1;
    let btn2 = document.getElementById("p2")
    btn2.disabled = !data.p2;
    if (!btn1.disabled) {
        btn1.innerText = "Player 1\n(Open)";
    }
    if (!btn2.disabled) {
        btn2.innerText = "Player 2\n(Open)";
    }
});

socket.on('loadGame', data => {

    document.getElementById("start").hidden = true;

    //obj has complete data to draw to page
    for (let obj of data) {
        let element = document.createElement(obj.element)
        element.id = obj.id;
        element.innerText = obj.text;

        attachAllChildren(element, obj)
        document.body.append(element);
    }
});

function attachAllChildren(element, obj) {

    let childElement;
    let data = [];

    for (let childData of obj.childData) {

        childElement = document.createElement(childData.element);
        childElement.innerText = childData.text;
        childElement.id = childData.id;
        
        if (childData.element === "button") {
            childElement.onclick = function () {
                socket.emit('choice', {
                    "choice": this.innerText,
                    "player": childData.player,
                });
            }
            childElement.disabled = childData.disabled;
        }

        if (childData.childData.length === 0) {
            data.push(childElement);
        } else {
            let toAdd = attachAllChildren(element, childData);
            for (let child of toAdd) {
                childElement.appendChild(child);
            }
            element.appendChild(childElement);
        }

    }

    return data;
}