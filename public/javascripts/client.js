//uses socket.io
const socket = io();

socket.on('serverMsg', data => {
    console.log(data.msg);
});

socket.on('loadGame', data => {

    let game = data.game;
    document.getElementById("start").hidden = true;

    for (let index in game.matchesToRun) {
        let container = document.createElement("div")
        container.id = "container" + index;
        container.innerText = "match" + (Number(index) + 1).toString();
        let match = game.matchesToRun[index];

        for (let player of Object.keys(match.contestants)) {
            let playerDiv = document.createElement("div");
            playerDiv.innerText = player;
            playerDiv.id = player;
            for (let option of game.ruleSets.ruleSets[match.rulesID].options) {
                let btn = document.createElement("button");
                btn.textContent = option.id;
                btn.onclick = function() {
                    // console.log(player, option.id);
                    socket.emit('choice', {"playerID": player, "option": option.id});
                }
                if (match.contestants[player].isBot === true) {
                    btn.disabled = true;
                }
                playerDiv.appendChild(btn);
            }
            container.appendChild(playerDiv);
        }
        document.body.appendChild(container);
    }

});