async function getDamageTables() {
    let url = 'EonIV_data.json';
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

function diceRoll(array = [1, 6, 0], ob = false) {
    // Slå tärning: (array = [antal tärningar, sidor på tärning, modifikation], ob=true/false)
    //console.log("Tärningar: " + array[0] + "T" + array[1] + "+" + array[2]);
    /*
    if (isNaN(parseInt(array[0])) || isNaN(parseInt(array[2])) || array[0] == "" || array[2] == "") {
        return "Fälten får bara innehålla siffror!"
    }
    */
    let rollSum = Math.floor(parseInt(array[2]));
    let rolledDice = [];
    for (rolls = 0; rolls < parseInt(Math.floor(array[0])); rolls++) {
        let currentRoll = Math.floor(Math.random() * parseInt(array[1])) + 1;
        rolledDice.push(currentRoll);
        if (currentRoll == array[1] && ob == true) {
            rolls -= 2;
            continue
        }
        rollSum += currentRoll;
    }
    //console.log(ob == true);
    if (ob == true) {
        document.getElementById("diceList").innerHTML = rolledDice + " + " + Math.floor(parseInt(array[2]));
    }
    /*
    if (document.getElementById("damCheckBox").checked) {
        document.getElementById("damage").value = parseInt(rollSum);
    }
    */
    console.log("Tärningar som rullats: " + rolledDice + ", med bonus: " + Math.floor(parseInt(array[2])));
    return parseInt(rollSum)
}


function calcSkadeTabellDice(damage) {
    // Om skada är under 1
    if (parseInt(damage) < 1) {
        return [0, [0, 0, 0]]
    }
    // Om skada är under 5
    if (damage < 5) {
        return [1, [0, 0, 0]]
    }
    // Om skada är mellan 5-9
    else if (damage < 10 && damage > 4) {
        return [2, [0, 0, 0]]
    }
    // Om skada är 10+
    else {
        let thisDam = Math.floor(damage / 5) * 2;
        let diceMod = damage - 14;
        if (diceMod <= 0) {
            diceMod = 0;
        }
        diceMod = Math.ceil(diceMod / 5) * 2;
        // Returnera [Utmattning, [antal tärningar, sidor på tärning, bonus till tärningsslag]]
        return [thisDam, [1, 10, diceMod]]
    }
    return
}


function calcDamResult() {
    // Räknar ut och sätter ut skaderesultat
    let damage = document.getElementById("damage").value;
    //let damageResult = [];
    let damageResult = calcSkadeTabellDice(damage);
    let table = document.getElementById("skadeTabell").value;
    let bodyPart = document.getElementById("kroppsDel2").value;
    let skadeText = "<tr><th>";

    // Om skada är under 10
    if (damage < 10) {
        skadeText += "Exempel:</th><td>Mindre skråma, knapp träff eller mindre brännskada.</td></tr>";
        skadeText += "<tr><th>Utmattning:</th><td>+" + damageResult[0] + "</td></tr>";
    } else {
        // Om skada är 10 eller mer
        //console.log("0: " + damageResult[1][0])
        //console.log("1: " + damageResult[1][1])
        //console.log("2: " + damageResult[1][2])
        var tableResult = diceRoll([parseInt(damageResult[1][0]), parseInt(damageResult[1][1]), parseInt(damageResult[1][2])]);
        // Om skaderesultatet är över 20...
        if (tableResult > 20) {
            // ... Sätt tabellresultatet till 20 eftersom tabellen bara går till 20
            var modResult = 20;
        } else {
            // ... Annars behåller vi tabellresultatet
            modResult = tableResult;
        }

        // Felsökning nedan
        //console.log("damage: " + damage);
        //console.log("tableResult: " + tableResult);
        //console.log("damageResult: " + damageResult[1]);
        //console.log("modResult: " + modResult)
        //console.log("bodyPart: " + bodyPart);
        //console.log("table: " + table);

        let damageContent = skadeTabeller[table][bodyPart][modResult];
        //console.log(damageContent);
        skadeText += "Tabellresultat:<th><td>" + modResult + "</td><tr>";
        skadeText += "<tr><th>Tärningsresultat:<th><td>" + tableResult + "</td><tr>";
        skadeText += "<tr><th>Exempel:<th><td>" + damageContent.text + "</td><tr>";
        skadeText += "<tr><th>Utmattning:<th><td>+" + damageResult[0] + "</td><tr>";
        if (damageContent.blodning[0] > 0) {
            skadeText += "<tr><th>Blödning:<th><td>" + damageContent.blodning[0] + "/" + damageContent.blodning[1] + "</td><tr>";
        }
        if (damageContent.infektion[0] > 0) {
            skadeText += "<tr><th>Infektion:<th><td>" + damageContent.infektion[0] + "/" + damageContent.infektion[1] + "</td><tr>";
        }
        if (damageContent.dodsSlag > 0) {
            if (parseInt(modResult) == 20) {
                if (table != "Slagsmål" && bodyPart != "Arm eller Ben") {
                    var deathSave = parseInt(damageContent.dodsSlag + tableResult);
                } else {
                    var deathSave = parseInt(damageContent.dodsSlag);
                }
            } else {
                var deathSave = parseInt(damageContent.dodsSlag);
            }
            skadeText += "<tr><th>Dödsslag:<th><td>" + deathSave + "</td><tr>";
        }
        if (damageContent.handelse[0]) {
            for (i = 0; i < damageContent.handelse.length; i++) {
                skadeText += "<tr><th>Händelse " + parseInt(i + 1) + ":<th><td>" + damageContent.handelse[i] + "</td><tr>";
            }
        }
    }
    document.getElementById("damageResult").innerHTML = skadeText;
    return
}


function setBodyParts(element) {
    // Sätter värdet i skadetabellens träffområden
    let kroppsTabell = document.getElementById("kroppsDel2");
    let container = document.getElementById("bodyPartContainer");

    // Tar bort den tidigare listan
    kroppsTabell.remove();

    // Skapar den nya listan
    kroppsTabell = document.createElement("select");
    kroppsTabell.id = "kroppsDel2";
    kroppsTabell.style.width = "120px";

    // Lägger in nya värden i kroppsdelslistan
    for (kroppsDel in skadeTabeller[element.value]) {
        let kroppOption = document.createElement("option");
        kroppOption.text = kroppsDel;
        kroppsTabell.add(kroppOption);
    }

    // Fäster listan i tabellen för visning
    container.appendChild(kroppsTabell);
    return element.value
}


function calcHitArea() {
    // Beräknar träfftabell med 1T10, returnerar: [Huvudområde, Delområde]
    let thisHit = diceRoll([1, 10, 0]);
    let thisPart = diceRoll([1, 10, 0]);

    if (thisHit == 1) {
        // Om 1 = Huvud
        if (thisPart < 5) {
            return ["Huvud", "Ansikte"]
        }
        if (thisPart > 4 && thisPart < 9) {
            return ["Huvud", "Skalle"]
        }
        if (thisPart > 8) {
            return ["Huvud", "Hals"]
        }
        return ["Huvud", "Huvud"]
    }
    if (thisHit > 1 && thisHit < 5) {
        // Om 2-4 = Torso
        if (thisPart < 7) {
            return ["Torso", "Bröstkorg"]
        }
        if (thisPart > 6 && thisPart < 10) {
            return ["Torso", "Mage"]
        }
        if (thisPart > 9) {
            return ["Torso", "Underliv"]
        }
        return ["Torso", "Torso"]
    }
    if (thisHit > 4 && thisHit < 7) {
        // Om 5-6 = Vänster arm
        if (thisPart < 3) {
            return ["Vänster arm", "Skuldra"]
        }
        if (thisPart > 2 && thisPart < 5) {
            return ["Vänster arm", "Överarm"]
        }
        if (thisPart == 5) {
            return ["Vänster arm", "Armbåge"]
        }
        if (thisPart > 5 && thisPart < 9) {
            return ["Vänster arm", "Underarm"]
        }
        if (thisPart > 8) {
            return ["Vänster arm", "Hand"]
        }
        return ["Vänster arm", "Arm eller Ben"]
    }
    if (thisHit > 6 && thisHit < 9) {
        // Om 7-8 = Höger arm
        if (thisPart < 3) {
            return ["Höger arm", "Skuldra"]
        }
        if (thisPart > 2 && thisPart < 5) {
            return ["Höger arm", "Överarm"]
        }
        if (thisPart == 5) {
            return ["Höger arm", "Armbåge"]
        }
        if (thisPart > 5 && thisPart < 9) {
            return ["Höger arm", "Underarm"]
        }
        if (thisPart > 8) {
            return ["Höger arm", "Hand"]
        }
        return ["Höger arm", "Arm eller Ben"]
    }
    if (thisHit == 9) {
        // Om 9 = Vänster ben
        if (thisPart < 3) {
            return ["Vänster ben", "Höft"]
        }
        if (thisPart > 2 && thisPart < 5) {
            return ["Vänster ben", "Lår"]
        }
        if (thisPart > 4 && thisPart < 7) {
            return ["Vänster ben", "Knä"]
        }
        if (thisPart > 6 && thisPart < 10) {
            return ["Vänster ben", "Vad"]
        }
        if (thisPart > 9) {
            return ["Vänster ben", "Fot"]
        }
        return ["Vänster ben", "Arm eller Ben"]
    }
    // Om 10 = Höger ben
    if (thisPart < 3) {
        return ["Höger ben", "Höft"]
    }
    if (thisPart > 2 && thisPart < 5) {
        return ["Höger ben", "Lår"]
    }
    if (thisPart > 4 && thisPart < 7) {
        return ["Höger ben", "Knä"]
    }
    if (thisPart > 6 && thisPart < 10) {
        return ["Höger ben", "Vad"]
    }
    if (thisPart > 9) {
        return ["Höger ben", "Fot"]
    }
    return ["Höger ben", "Arm eller Ben"]
}


async function initPage() {
    // Körs när sidan laddat
    let damageInput = document.getElementById("damage");
    let tabellSelect = document.getElementById("skadeTabell");
    let kroppSelect = document.getElementById("kroppsDel2");

    // Sätter värden i inputs och selects
    skadeTabeller = await getDamageTables();
    damageInput.value = 0;
    for (tabell in skadeTabeller) {
        let tabellOption = document.createElement("option");
        tabellOption.text = tabell;
        tabellSelect.add(tabellOption);
    }
    for (kroppsDel in skadeTabeller[tabellSelect.value]) {
        let kroppOption = document.createElement("option");
        kroppOption.text = kroppsDel;
        kroppSelect.add(kroppOption);
    }

}
