//uses socket.io
const socket = io();

socket.on('serverMsg', data => {
    console.log(data.msg);
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